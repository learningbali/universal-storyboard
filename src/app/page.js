"use client";
import { useState } from "react";
import { Sparkles, Loader2, Image as ImageIcon } from "lucide-react";

export default function Home() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [storyboard, setStoryboard] = useState(null);

  const generateStoryboard = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputPrompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setStoryboard(data);
      } else {
        alert(data.error || "Terjadi kesalahan");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="bg-black text-white min-h-screen font-sans p-4 md:p-8 flex flex-col items-center">
      {/* INPUT FORM */}
      <div class="w-full max-w-xl bg-zinc-900 border border-zinc-800 p-5 rounded-xl mb-10 shadow-2xl">
        <h2 class="text-lg font-bold mb-3 flex items-center gap-2 text-amber-500">
          <Sparkles size={18} /> AI Universal Storyboard Generator
        </h2>
        <form onSubmit={generateStoryboard} class="flex gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Contoh: Bikin video ASMR masak ramen durasi 15 detik..."
            class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            disabled={loading}
          />
          <button
            type="submit"
            class="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <Loader2 class="animate-spin" size={16} /> : "Generate"}
          </button>
        </form>
      </div>

      {/* RENDER PREVIEW STORYBOARD */}
      {storyboard ? (
        <div class="w-full max-w-4xl border border-zinc-800 bg-black p-6 rounded-lg flex flex-col justify-between shadow-2xl">
          {/* HEADER */}
          <header class="text-center my-6 uppercase tracking-wider">
            <p class="text-zinc-400 text-xs md:text-sm font-semibold tracking-widest">{storyboard.title}</p>
            <h1 class="text-amber-500 text-2xl md:text-4xl font-bold font-serif my-2 tracking-wide">{storyboard.subtitle}</h1>
            <p class="text-zinc-500 text-[10px] md:text-xs tracking-widest">{storyboard.duration} - {storyboard.ratio}</p>
          </header>

          {/* GRID */}
          <main class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-6">
            {storyboard.scenes?.map((scene) => (
              <div key={scene.id} class="border border-zinc-800 flex flex-col justify-between bg-zinc-950/60 rounded overflow-hidden">
                <div class="p-2 text-[10px] font-mono border-b border-zinc-800 text-zinc-400 bg-zinc-900/40 uppercase">
                  SCENE {scene.id} <span class="text-zinc-700">|</span> {scene.timestamp}
                </div>
                
                {/* placeholder gambar menggunakan kata kunci dari AI */}
                <div class="relative aspect-[4/3] bg-zinc-900 flex items-center justify-center overflow-hidden group">
                  <img 
                    src={`https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=400&auto=format&fit=crop&q=60`} 
                    alt={scene.description}
                    class="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition duration-500"
                  />
                  <div class="absolute bottom-1 right-1 bg-black/70 p-1 rounded text-[8px] text-zinc-500 flex items-center gap-1">
                    <ImageIcon size={10} /> {scene.image_placeholder_query}
                  </div>
                </div>

                <div class="p-3 text-center text-[11px] tracking-wide border-t border-zinc-800 flex-1 flex flex-col justify-center bg-zinc-950">
                  <p class="font-medium text-zinc-200 leading-relaxed uppercase">{scene.description}</p>
                  <p class="text-amber-500 text-[9px] mt-2 font-mono tracking-wider">SFX: {scene.sfx}</p>
                </div>
              </div>
            ))}
          </main>

          {/* FOOTER */}
          <footer class="flex flex-wrap justify-center gap-4 md:gap-8 text-[10px] text-zinc-500 border-t border-zinc-900 pt-6 mt-6 tracking-widest uppercase">
            {storyboard.footer_notes?.map((note, idx) => (
              <div key={idx} class="flex items-center gap-1">
                <span>⚡ {note}</span>
              </div>
            ))}
          </footer>
        </div>
      ) : (
        {!loading && (
          <div class="text-zinc-600 text-sm border border-dashed border-zinc-800 p-10 rounded-xl max-w-md text-center">
            Masukkan ide konten Anda di atas untuk membuat visual storyboard otomatis berbasis AI.
          </div>
        )}
      )}
    </div>
  );
}
