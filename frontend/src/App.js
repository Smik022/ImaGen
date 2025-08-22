import React, { useState, useEffect } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL; // Make sure this is set in Vercel

  const handleGenerate = async () => {
    if (cooldown > 0) return;
    if (!prompt.trim()) {
      setError("Please enter a prompt!");
      return;
    }

    setError("");
    setLoading(true);
    setImageUrl(null);
    setCaption("");

    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: prompt }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Something went wrong!");

      setImageUrl(data.image_url);
      setCaption(data.caption);

      setCooldown(45); // cooldown timer
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleGenerate();
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>✨ ImaGEN AI Image Generator ✨</h1>
      <p style={styles.subtitle}>Transform your ideas into vivid AI-generated images</p>

      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Enter your creative prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.input}
        />
        <button
          onClick={handleGenerate}
          style={{
            ...styles.button,
            backgroundColor: cooldown > 0 ? "#888" : "#4f46e5",
            cursor: cooldown > 0 ? "not-allowed" : "pointer",
          }}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Wait ${cooldown}s` : "Generate"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading && (
        <div style={styles.loadingContainer}>
          <div className="spinner" style={styles.spinner}></div>
          <p style={styles.loadingText}>Generating image, please wait...</p>
        </div>
      )}

      {imageUrl && (
        <div style={styles.resultContainer}>
          <p style={styles.caption}>{caption}</p>
          <img src={imageUrl} alt={caption} style={styles.image} />
        </div>
      )}

      <style>{`
        .spinner {
          border: 6px solid #f3f3f3;
          border-top: 6px solid #4f46e5;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: "center",
    padding: "50px 20px",
    background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
    minHeight: "100vh",
  },
  title: { fontSize: "3rem", color: "#4f46e5", marginBottom: "10px" },
  subtitle: { fontSize: "1.2rem", marginBottom: "30px", color: "#333" },
  inputContainer: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  input: { width: "300px", padding: "12px 15px", fontSize: "1rem", borderRadius: "10px", border: "1px solid #ccc", outline: "none" },
  button: { padding: "12px 25px", fontSize: "1rem", borderRadius: "10px", border: "none", color: "#fff", transition: "background-color 0.3s" },
  error: { color: "red", marginBottom: "20px" },
  loadingContainer: { marginTop: "30px" },
  loadingText: { marginTop: "10px", fontSize: "1rem", color: "#555" },
  resultContainer: { marginTop: "30px" },
  caption: { fontSize: "1.1rem", fontWeight: "bold", marginBottom: "10px", color: "#333" },
  image: { maxWidth: "80%", borderRadius: "15px", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" },
};

export default App;
