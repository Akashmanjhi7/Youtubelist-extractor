# Frontend (React + Vite) for youtube-playlist-extractor

Steps to run (Windows, after Node is installed):

1. cd frontend
2. npm install
3. npm run dev

If your backend is not on http://localhost:8000, set environment variable:
- Windows (PowerShell):
  $env:VITE_BACKEND_URL="http://your-backend-url"
- Or create a .env file with VITE_BACKEND_URL=http://your-backend-url
