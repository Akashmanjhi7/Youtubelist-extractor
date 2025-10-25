from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pytube import Playlist
from fastapi.middleware.cors import CORSMiddleware

class PlaylistRequest(BaseModel):
    url: str

app = FastAPI(title="YouTube Playlist Extractor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
