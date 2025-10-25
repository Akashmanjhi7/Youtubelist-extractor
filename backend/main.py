from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pytube import Playlist
from fastapi.middleware.cors import CORSMiddleware

class PlaylistRequest(BaseModel):
    url: str

app = FastAPI(title="YouTube Playlist Extractor API")

# frontend ke domains ko allow kar rahe hain
origins = [
    "http://localhost:5173",  # Local testing ke liye
    "https://ytplaylistextract.vercel.app",  # Tumhara live Vercel domain
    "https://youtubelist-extractor-onrender.com" # Khud ka domain bhi add karna
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Ab sirf defined origins allow honge
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/extract")
async def extract(req: PlaylistRequest):
    url = (req.url or "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        p = Playlist(url)
        videos = list(p.video_urls)
        title = None
        try:
            title = p.title
        except Exception:
            title = None

        return {
            "title": title,
            "count": len(videos),
            "videos": videos
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract playlist: {e}")
