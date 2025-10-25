from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pytube import Playlist, YouTube, exceptions
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import re 
import time

# Naya Pydantic model video details ke liye
class VideoDetail(BaseModel):
    title: str
    url: str
    thumbnail: str
    
class PlaylistRequest(BaseModel):
    url: str

app = FastAPI(title="YouTube Playlist Extractor API")

# frontend ke domains ko allow kar rahe hain
origins = [
    "http://localhost:5173",  
    "https://ytplaylistextract.vercel.app",  
    "https://youtubelist-extractor-onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility function to get Video ID from URL
def get_video_id(url):
    """URL se video ID nikalta hai."""
    match = re.search(r'(?:v=|\/embed\/|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})', url)
    if match:
        return match.group(1)
    return None

# Naya function jo title nikalne ki koshish karega
def get_video_title_safely(video_url: str, retries: int = 2) -> Optional[str]:
    """Pytube se title nikalne ki koshish karta hai, agar fail ho toh retry karta hai."""
    for i in range(retries):
        try:
            yt = YouTube(video_url)
            
            # Agar title seedhe na mile, toh ek aur property access karke dekhte hain 
            # (jisse pytube ka internal data load ho jaye)
            if not yt.title:
                _ = yt.caption_tracks 
            
            if yt.title:
                print(f"✅ Extracted Title after {i+1} attempt.")
                return yt.title
                
        except exceptions.AgeRestrictedError:
             print(f"❌ Video is Age Restricted: {video_url}")
             return "Age Restricted Video"
        except Exception as e:
            # 400 Bad Request ya koi aur error, to thoda wait karke retry karte hain
            print(f"⚠️ Title extraction failed ({e}). Retrying in 1s...")
            time.sleep(1)
            
    return None # Agar saare retries fail ho jayein toh None return karo

@app.post("/extract", response_model=dict)
async def extract(req: PlaylistRequest):
    url = (req.url or "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        p = Playlist(url)
        video_urls = list(p.video_urls)
        
        extracted_videos: List[VideoDetail] = []

        # URLs ko loop karo
        for i, video_url in enumerate(video_urls):
            
            # Default values (fallback)
            title = f"Video {i+1}" 
            video_id = get_video_id(video_url)
            thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg" if video_id else "https://via.placeholder.com/120x67?text=No+Thumb"

            # Title ko safely nikalne ki koshish
            actual_title = get_video_title_safely(video_url)
            if actual_title:
                title = actual_title
                
            # Frontend ko data bhej do
            extracted_videos.append(VideoDetail(
                title=title,
                url=video_url,
                thumbnail=thumbnail_url
            ))
        
        # Playlist Title extraction
        playlist_title: Optional[str] = None
        try:
            playlist_title = p.title
        except Exception:
            playlist_title = "Untitled Playlist"
            
        return {
            "title": playlist_title,
            "count": len(extracted_videos),
            "videos": extracted_videos 
        }

    except Exception as e:
        error_detail = f"Failed to extract playlist: {e}"
        if 'private' in str(e).lower() or 'unavailable' in str(e).lower():
             error_detail = "This playlist might be private, deleted, or unavailable in your region."
             
        raise HTTPException(status_code=500, detail=error_detail)