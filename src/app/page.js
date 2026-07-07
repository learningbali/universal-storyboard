"use client";
import { useState } from "react";
import { Sparkles, Loader2, Image as ImageIcon, Film, Download } from "lucide-react";

export default function Home() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [storyboard, setStoryboard] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  // 1. Fungsi Generate Text Storyboard
  const generateText = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    
    setLoadingText(true);
    setImageUrls({}); // Reset gambar lama
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
        alert(data.error || "Terjadi kesalahan pada AI");
      }
    } catch (err) {
      alert("Gagal terhubung ke server API");
    } finally {
      setLoadingText(false);
    }
  };

  // 2. Fungsi Generate Gambar Berdasarkan Keyword AI
  const generateImages = () => {
    if (!storyboard || !storyboard.scenes) return;
    setLoadingImages(true);
    
    const newUrls = {};
    storyboard.scenes.forEach((scene) => {
      // Menggunakan Unsplash Source dengan parameter acak (random id) agar gambar antar scene tidak kembar
      const query = encodeURIComponent(scene.image_placeholder_query || "cinematic dark");
      newUrls[scene.id] = `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500&auto=format&fit=crop&sig=${scene.id}_${Date.now()}`;
      
      // Mengarahkan query pencarian yang lebih akurat
      if (inputPrompt.toLowerCase().includes("lego")) {
        newUrls[scene.id] = `https://source.unsplash.com/featured/500x375/?lego,toy,block&sig=${scene.id}`;
      } else {
        newUrls[scene.id] = `https://source.unsplash.com/featured/500x375/?${query}&sig=${scene.id}`;
      }
    });

    // Fallback jika source unsplash membatasi request, gunakan loremflickr yang sangat stabil
    storyboard.scenes.forEach((scene) => {
      const query = encodeURIComponent(scene.image_placeholder_query || "cinematic");
      newUrls[scene.id] = `https://loremflickr.com/500/375/${query}?random=${scene.id}`;
    });

    setTimeout(() => {
      setImageUrls(newUrls);
      setLoadingImages(false);
    }, 1500); // Simulasi loading estetik
  };

  return (
    <div class="bg-black text-white min-h-screen font-sans p-4 md:p-8 flex flex-col items-center select-none bg-radial-gradient">
      
      {/* PANEL KONTROL PREMIUM */}
      <div class="w-full max-w-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800/60 p-6 rounded-2xl mb-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <h2 class="text-md font-bold mb-4 flex items-center gap-2 text-amber-500 tracking-wider uppercase">
          <Film size={18} class="text-amber-500" /> Director's Control Panel
        </h2>
        <div class="flex flex-col gap-4">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Contoh: ASMR merakit LEGO Pajero hitam durasi 10 detik..."
            class="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder-zinc-600 shadow-inner"
            disabled={loadingText}
          />
          
          {/* TOMBOL DUAL AKSI */}
          <div class="grid grid-cols-2 gap-3">
            <button
              onClick={generateText}
              class="bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-zinc-700 font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-40 tracking-widest uppercase"
              disabled={loadingText || !inputPrompt.trim()}
            >
              {loadingText ? <Loader2 class="animate-spin" size={14} /> : <Sparkles size={14} />} 
              1. Generate Text
            </button>
            
            <button
              onClick={generateImages}
              class="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-40 tracking-widest uppercase shadow-[0_4px_20px_rgba(245,158,11,0.3)]"
              disabled={loadingImages || !storyboard || loadingText}
            >
              {loadingImages ? <Loader2 class="animate-spin" size={14} /> : <ImageIcon size={14} />} 
              2. Generate Image
            </button>
          </div>
        </div>
      </div>

      {/* RENDER KANVAS PREVIEW BERCORAK SINEMATIK GELAP */}
      {storyboard ? (
        <div class="w-full max-w-4xl border border-zinc-800/80 bg-zinc-950/40 p-6 md:p-8 rounded-2xl flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] transition-all duration-700">
          
          {/* BANNER HEADER */}
          <header class="text-center my-6 uppercase tracking-widest">
            <p class="text-zinc-400 text-xs font-bold tracking-[0.3em] mb-1">{storyboard.title}</p>
            <h1 class="text-amber-500 text-3xl md:text-5xl font-extrabold my-2 tracking-wide font-serif drop-shadow-md">
              {storyboard.subtitle}
            </h1>
            <div class="h-[1px] w-24 bg-amber-500/30 mx-auto my-3"></div>
            <p class="text-zinc-500 text-[10px] tracking-[0.2em] font-mono">{storyboard.duration} - {storyboard.ratio}</p>
          </header>

          {/* GRID PANELS (3 KOLOM PREMIUM) */}
          <main class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-6">
            {storyboard.scenes?.map((scene) => (
              <div key={scene.id} class="border border-zinc-800/70 flex flex-col justify-between bg-black/90 rounded-xl overflow-hidden shadow-lg hover:border-zinc-700 transition-all duration-300">
                
                {/* HEAD BAR SCENE */}
                <div class="p-2.5 text-[10px] font-mono border-b border-zinc-800 text-zinc-400 bg-zinc-900/60 uppercase tracking-widest flex justify-between items-center">
                  <span>SCENE {scene.id}</span>
                  <span class="text-amber-500/80 font-bold">{scene.timestamp}</span>
                </div>
                
                {/* MULTI-SOURCE IMAGE CONTAINER */}
                <div class="relative aspect-[4/3] bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800/50 group">
                  {imageUrls[scene.id] ? (
                    <img 
                      src={imageUrls[scene.id]} 
                      alt={scene.description}
                      class="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div class="text-zinc-700 flex flex-col items-center gap-1.5 p-4 text-center">
                      <ImageIcon size={24} class="opacity-30 animate-pulse text-amber-500" />
                      <span class="text-[9px] uppercase tracking-wider text-zinc-600">Klik "Generate Image"</span>
                    </div>
                  )}
                  <div class="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[8px] text-zinc-500 border border-zinc-800 uppercase tracking-tight">
                    🔍 {scene.image_placeholder_query}
                  </div>
                </div>

                {/* VISUAL & SFX TEXT DESCRIPTION */}
                <div class="p-4 text-center text-[11px] tracking-wide flex-1 flex flex-col justify-between min-h-[90px] bg-zinc-950/60">
                  <p class="font-medium text-zinc-300 leading-relaxed uppercase tracking-normal">{scene.description}</p>
                  <p class="text-amber-500 text-[9px] font-mono tracking-widest font-bold mt-3 border-t border-zinc-900 pt-2">
                    SFX: {scene.sfx}
                  </p>
                </div>
              </div>
            ))}
          </main>

          {/* FOOTER BAR */}
          <footer class="flex flex-wrap justify-center gap-6 md:gap-12 text-[10px] text-zinc-500 border-t border-zinc-900 pt-6 mt-6 tracking-[0.2em] uppercase font-medium">
            {storyboard.footer_notes?.map((note, idx) => (
              <div key={idx} class="flex items-center gap-1.5 text-zinc-400">
                <span class="text-amber-500 text-xs">▪</span> {note}
              </div>
            ))}
          </footer>
        </div>
      ) : (
        !loadingText && (
          <div class="text-zinc-600 text-xs tracking-widest border border-dashed border-zinc-800/80 p-12 rounded-2xl max-w-md text-center bg-zinc-950/20 uppercase">
            Silakan masukkan ide konsep video Anda pada kolom di atas untuk memulai produksi.
          </div>
        )
      )}
    </div>
  );
}
