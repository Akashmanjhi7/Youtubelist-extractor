# Backend (FastAPI + pytube) for youtube-playlist-extractor

Run locally (Windows):

1. Create and activate virtualenv:
   python -m venv venv
   venv\Scripts\activate

2. Install:
   pip install -r requirements.txt

3. Run:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

API:
POST http://localhost:8000/extract
Body (JSON):
{ "url": "https://www.youtube.com/playlist?list=..." }
