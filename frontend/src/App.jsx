import React, { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const RENDER_SLEEP_MESSAGE = "Render ka server abhi so raha hai (spin down). Thoda sabar karo aur 60 seconds baad dubara try karo. Ya Render URL ko ek baar browser mein kholkar jaaga lo. 😉";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function handleExtract(e) {
    e.preventDefault();
    setError("");
    setVideos([]);
    setTitle("");
    if (!url.trim()) {
      setError("Playlist URL dalna zaroori hai.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Server error");
      }
      setTitle(data.title || "Untitled Playlist");
      setVideos(data.videos || []);
    } catch (err) {
      // Check for common 'Failed to fetch' error indicative of a sleeping server
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError(RENDER_SLEEP_MESSAGE);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    const text = videos.join("\n");
    navigator.clipboard.writeText(text);
    alert("Saari links clipboard mein copy ho gayi!");
  }

  return (
    <div className="container">
      <h1>🚀 YouTube Playlist Extractor</h1>

      <form onSubmit={handleExtract} className="form">
        <input
          placeholder="YouTube playlist URL yahan paste karo..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Extracting..." : "Extract Links"}
        </button>
      </form>

      {error && <div className={`error ${error === RENDER_SLEEP_MESSAGE ? 'sleep-warning' : ''}`}>{error}</div>}

      {title && (
        <div className="result">
          <h2>{title}</h2>
          <p>Total videos: {videos.length}</p>
          <button onClick={copyAll} disabled={videos.length === 0}>
            Copy All
          </button>

          <ol className="video-list">
            {videos.map((v, i) => (
              <li key={i}>
                <a href={v} target="_blank" rel="noreferrer">{v}</a>
                <button onClick={() => navigator.clipboard.writeText(v)}>Copy</button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}