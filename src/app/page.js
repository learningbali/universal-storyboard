"use client";
import { useState } from "react";
import { Sparkles, Loader2, Image as ImageIcon, Film } from "lucide-react";

export default function Home() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [storyboard, setStoryboard] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  // 1. Fungsi Generate Text Storyboard via Gemini
  const generateText = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    
    setLoadingText(true);
    setImageUrls({}); 
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

  // 2. Fungsi Generate Gambar AI Spesifik Alur, Resolusi Ringan, & Load Satu per Satu
 // 2. Fungsi Generate Gambar AI - Versi Final Anti-Error & Pasti Sinkron
  const generateImages = async () => {
    if (!storyboard || !storyboard.scenes) return;
    setLoadingImages(true);
    setImageUrls({}); // Reset layar dari gambar lama
    
    // Jalankan antrean tertib memuat gambar satu per satu secara berurutan
    for (let i = 0; i < storyboard.scenes.length; i++) {
      const scene = storyboard.scenes[i];
      
      // Ambil kata kunci cadangan bahasa inggris dari AI, jika kosong gunakan default mainan mobil
      const englishKeyword = (scene.image_placeholder_query || "miniature toy car").toLowerCase();
      
      // Trik Jitu: Menyusun alur prompt berdasarkan nomor urut Scene agar gambar berurutan maju dan sinkron
      let scenePromptEn = `assembling parts of small plastic toy car`;
      
      if (i === 0) {
        scenePromptEn = `hands unboxing miniature plastic toy car parts package on top of a clean table`;
      } else if (i === 1) {
        scenePromptEn = `hands holding and picking up a small plastic toy car chassis component`;
      } else if (i === 2 || i === 3) {
        scenePromptEn = `macro close up of hands attaching tiny rubber wheels onto a miniature toy car chassis`;
      } else if (i === 4) {
        scenePromptEn = `hands carefully clicking and snapping a colorful car body shell onto the chassis`;
      } else if (i === 5) {
        scenePromptEn = `macro shot of tweezers putting small decorative stickers onto a mini toy car`;
      } else if (i === 6) {
        scenePromptEn = `hands spinning and testing the wheels of a completed small mini toy car model`;
      } else if (i === 7) {
        scenePromptEn = `final showcase display of a fully assembled beautiful mini toy car on a dark wooden studio table`;
      }

      // Gabungkan menjadi instruksi gambar studio makro sinematik yang bersih tanpa karakter aneh
      const sharpAiPrompt = `macro photography of ${scenePromptEn}, focused on ${englishKeyword}, professional toy photography style, warm studio lighting, bokeh background, sharp texture details`;
      
      // Enkripsi prompt agar aman dikirim melalui link URL internet
      const encodedPrompt = encodeURIComponent(sharpAiPrompt);
      
      // OPTIMASI UKURAN: Menggunakan resolusi kecil (350x262) agar proses load secepat kilat dan anti-blokir
      const finalImageSourceUrl = `https://image.pollinations.ai/p/${encodedPrompt}?width=350&height=262&seed=${scene.id}&nologo=true&t=${Date.now()}`;
      
      // Masukkan gambar ke dalam antrean visual satu per satu secara bergantian
      setImageUrls((prev) => ({ 
        ...prev, 
        [scene.id]: finalImageSourceUrl 
      }));
      
      // Berikan jeda waktu 700 milidetik (0.7 detik) agar server AI memproses gambar secara rileks satu per satu
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    setLoadingImages(false);
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans p-4 md:p-8 flex flex-col items-center">
      
      {/* PANEL KONTROL */}
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-10 shadow-2xl">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-amber-500 tracking-wider uppercase">
          <Film size={16} /> Director's Control Panel
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Contoh: ASMR merakit miniatur puzzle sepeda anak..."
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder-zinc-700 shadow-inner"
            disabled={loadingText}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={generateText}
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-zinc-700 font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-40 tracking-widest uppercase"
              disabled={loadingText || !inputPrompt.trim()}
            >
              {loadingText ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} 
              1. Generate Text
            </button>
            
            <button
              onClick={generateImages}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-40 tracking-widest uppercase shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
              disabled={loadingImages || !storyboard || loadingText}
            >
              {loadingImages ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />} 
              2. Generate Image
            </button>
          </div>
        </div>
      </div>

      {/* TAMPILAN GRID STORYBOARD */}
      {storyboard ? (
        <div className="w-full max-w-4xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 rounded-2xl flex flex-col justify-between shadow-2xl">
          
          {/* HEADER */}
          <header className="text-center my-6 uppercase tracking-widest">
            <p className="text-zinc-400 text-xs font-bold tracking-[0.3em] mb-1">{storyboard.title}</p>
            <h1 className="text-amber-500 text-2xl md:text-4xl font-extrabold my-2 tracking-wide font-serif">
              {storyboard.subtitle}
            </h1>
            <div className="h-[1px] w-24 bg-amber-500/30 mx-auto my-3"></div>
            <p className="text-zinc-500 text-[10px] tracking-[0.2em] font-mono">{storyboard.duration} - {storyboard.ratio}</p>
          </header>

          {/* GRID PANELS (3 KOLOM SEJAJAR) */}
          <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-6">
            {storyboard.scenes?.map((scene) => (
              <div key={scene.id} className="border border-zinc-800 flex flex-col justify-between bg-black rounded-xl overflow-hidden shadow-lg transition-all duration-300">
                
                {/* TIMESTAMPS */}
                <div className="p-2.5 text-[10px] font-mono border-b border-zinc-800 text-zinc-400 bg-zinc-900/60 uppercase tracking-widest flex justify-between items-center">
                  <span>SCENE {scene.id}</span>
                  <span className="text-amber-500/80 font-bold">{scene.timestamp}</span>
                </div>
                
                {/* KOTAK KONTAINER GAMBAR AI (UKURANNYA SUDAH KECIL & RINGAN DI SINI) */}
                <div className="relative aspect-[4/3] max-w-[240px] w-full mx-auto my-3 bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-900 rounded-lg shadow-inner">
                  {imageUrls[scene.id] ? (
                    <img 
                      src={imageUrls[scene.id]} 
                      alt={scene.description}
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="text-zinc-700 flex flex-col items-center gap-1.5 p-4 text-center animate-pulse">
                      <ImageIcon size={16} className="text-amber-500/40" />
                      <span className="text-[8px] uppercase tracking-widest text-zinc-700">Menunggu...</span>
                    </div>
                  )}
                </div>

                {/* TEXT DESKRIPSI & SFX */}
                <div className="p-4 text-center text-[11px] tracking-wide flex-1 flex flex-col justify-between min-h-[95px] bg-zinc-950">
                  <p className="font-medium text-zinc-300 leading-relaxed uppercase">{scene.description}</p>
                  <p className="text-amber-500 text-[9px] font-mono tracking-widest font-bold mt-3 border-t border-zinc-900 pt-2">
                    SFX: {scene.sfx}
                  </p>
                </div>
              </div>
            ))}
          </main>

          {/* FOOTER */}
          <footer className="flex flex-wrap justify-center gap-6 md:gap-12 text-[10px] text-zinc-500 border-t border-zinc-900 pt-6 mt-6 tracking-[0.2em] uppercase font-medium">
            {storyboard.footer_notes?.map((note, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-zinc-400">
                <span className="text-amber-500 text-xs">▪</span> {note}
              </div>
            ))}
          </footer>
        </div>
      ) : (
        !loadingText && (
          <div className="text-zinc-600 text-xs tracking-widest border border-dashed border-zinc-800 p-12 rounded-2xl max-w-md text-center bg-zinc-950/20 uppercase">
            Silakan masukkan ide konsep video Anda pada kolom di atas untuk memulai produksi.
          </div>
        )
      )}
    </div>
  );
}
