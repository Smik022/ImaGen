import { useState } from "react";

function App() {
  const [chatInput, setChatInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setImageUrl("");
    setCaption("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setImageUrl(data.image_url);
        setCaption(data.caption);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>ImaGEN - AI Image Generator</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter prompt"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          style={{ width: "300px", padding: "10px" }}
        />
        <button type="submit" style={{ marginLeft: "10px", padding: "10px" }}>
          Generate
        </button>
      </form>

      {loading && <p>Generating image...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Caption: {caption}</h3>
          <img src={imageUrl} alt={caption} style={{ maxWidth: "500px" }} />
        </div>
      )}
    </div>
  );
}

export default App;
