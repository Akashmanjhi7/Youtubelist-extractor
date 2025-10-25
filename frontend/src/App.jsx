import React, { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const RENDER_SLEEP_MESSAGE = "Render ka server abhi so raha hai (spin down). Thoda sabar karo aur 60 seconds baad dubara try karo. Ya Render URL ko ek baar browser mein kholkar jaaga lo. 😉";

// Naya component har video item ko display karne ke liye
const VideoItem = ({ video, index }) => {
    const { title, url, thumbnail } = video;

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        alert(`'${title}' ka link copy ho gaya!`);
    };

    return (
        // Key ko li mein use kar rahe hain, jo best practice hai
        <li key={index} className="video-item-detail">
            {/* Thumbnail link ke andar daala hai */}
            <a href={url} target="_blank" rel="noreferrer" className="video-link">
                <img 
                    src={thumbnail} 
                    alt={title} 
                    className="video-thumbnail" 
                    // Agar thumbnail load na ho to ek simple fallback text ya icon dikhaye
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/120x67?text=No+Thumb"; e.target.style.opacity = 0.5; }}
                />
            </a>
            <div className="video-info">
                {/* Title dikhaya */}
                <span className="video-title" title={title}>{title}</span>
            </div>
            {/* Copy button title ke right side mein */}
            <button onClick={copyLink} title="Copy Link">
                🔗 Copy
            </button>
        </li>
    );
};


export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]); // Ab list of objects hoga
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
      setVideos(data.videos || []); // data.videos mein ab objects hain
    } catch (err) {
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
    // Ab videos object ki list se sirf URLs ko map karke join kar rahe hain
    const text = videos.map(v => v.url).join("\n");
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
            Copy All Links
          </button>

          <ol className="video-list">
            {videos.map((v, i) => (
              // VideoItem component render ho raha hai
              <VideoItem key={i} video={v} index={i} />
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}