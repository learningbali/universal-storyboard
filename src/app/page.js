"use client";
import { useState } from "react";
import { Sparkles, Loader2, Image as ImageIcon, Film } from "lucide-react";

export default function Home() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [storyboard, setStoryboard] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

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

  // 2. Fungsi Generate Gambar - Otomatis Mengikuti Intisari Cerita & Konsisten Berdasarkan Subjek
  const generateImages = async () => {
    if (!storyboard || !storyboard.scenes) return;
    setLoadingImages(true);
    setImageUrls({}); 

    // 1. Ekstrak subjek utama dari judul (contoh: "MITSUBISHI PAJERO DAKKAR" atau "SEPEDA ANAK IMUT")
    // Kita bersihkan kata-kata filter agar menjadi kata benda murni bahasa inggris / nama model asli
    const mainObject = (storyboard.subtitle || storyboard.title || "miniature model")
      .toLowerCase()
      .replace(/asmr|merakit|puzzle|video|short/g, "")
      .trim();

    // Kamus instan untuk mendeteksi aksi utama dalam Bahasa Indonesia ke Bahasa Inggris
    const translateAction = (textIndo) => {
      const txt = textIndo.toLowerCase();
      if (txt.includes("buka") || txt.includes("kotak") || txt.includes("kemasan")) return "unboxing and opening the package of";
      if (txt.includes("chassis") || txt.includes("rangka") || txt.includes("dasar")) return "assembling the chassis core frame of";
      if (txt.includes("roda") || txt.includes("ban") || txt.includes("as roda")) return "extreme close up of hands installing wheels on";
      if (txt.includes("stang") || txt.includes("sadel") || txt.includes("kemudi") || txt.includes("stuck")) return "fixing the handlebar and seating details onto";
      if (txt.includes("bodi") || txt.includes("body") || txt.includes("pasang bodi")) return "snapping the colorful body shell onto";
      if (txt.includes("stiker") || txt.includes("sticker") || txt.includes("pinset") || txt.includes("logo")) return "using tweezers to apply tiny decals and stickers onto";
      if (txt.includes("tes") || txt.includes("uji") || txt.includes("putar")) return "testing and spinning the functional parts of the completed";
      if (txt.includes("akhir") || txt.includes("selesai") || txt.includes("pamer") || txt.includes("rampung")) return "final showcase display of the fully finished";
      
      // Jika tidak ada kata kunci yang cocok, gunakan query objek bahasa inggris bawaan dari Gemini backend
      return "detailed assembly process of";
    };

    // Antrean tertib memuat gambar satu per satu (Sequential Load)
    for (let i = 0; i < storyboard.scenes.length; i++) {
      const scene = storyboard.scenes[i];
      
      // Tentukan core action berdasarkan intisari deskripsi scene masing-masing
      const coreActionEn = translateAction(scene.description);
      
      // Ambil keyword inggris spesifik objek dari scene (bawaan dari Gemini)
      const sceneKeyword = (scene.image_placeholder_query || "toy part").toLowerCase();

      // RANCANGAN PROMPT CERDAS: 
      // Menggabungkan (Aksi Inti Sesuai Scene) + (Nama Objek Utama dari Judul agar Konsisten) + (Detail Fokus dari Gemini)
      const sharpAiPrompt = `macro close up photography of hands doing ${coreActionEn} ${mainObject}, focusing on ${sceneKeyword}, realistic miniature scale toy style, warm studio lighting, bokeh background, highly detailed texture`;
      const encodedPrompt = encodeURIComponent(sharpAiPrompt);
      
      // UKURAN KECIL & CEPAT: Resolusi draf diperkecil ke 280x210 agar muat instan tanpa membuat server AI macet
      // Menggunakan SEED dinamis yang dikunci per ID agar variasi render tetap rapi namun runtut
      const finalImageSourceUrl = `https://image.pollinations.ai/p/${encodedPrompt}?width=280&height=210&seed=${scene.id}&nologo=true&t=${Date.now()}`;
      
      // Update state per satu adegan demi adegan
      setImageUrls((prev) => ({ 
        ...prev, 
        [scene.id]: finalImageSourceUrl 
      }));
      
      // Jeda 650 milidetik agar server AI memproses antrean gambar secara rileks dan anti-gagal
      await new Promise((resolve) => setTimeout(resolve, 650));
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
            placeholder="Masukkan ide bebas: rakit lego, miniatur puzzle sepeda, mainan robot..."
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

          {/* GRID PANELS */}
          <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-6">
            {storyboard.scenes?.map((scene) => (
              <div key={scene.id} className="border border-zinc-800 flex flex-col justify-between bg-black rounded-xl overflow-hidden shadow-lg transition-all duration-300 relative">
                
                {/* TIMESTAMPS */}
                <div className="p-2.5 text-[10px] font-mono border-b border-zinc-800 text-zinc-400 bg-zinc-900/60 uppercase tracking-widest flex justify-between items-center">
                  <span>SCENE {scene.id}</span>
                  <span className="text-amber-500/80 font-bold">{scene.timestamp}</span>
                </div>
                
                {/* KONTAINER MINI THUMBNAIL */}
                <div className="relative aspect-[4/3] max-w-[200px] w-full mx-auto my-4 bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-900 rounded-lg shadow-inner">
                  {imageUrls[scene.id] ? (
                    <img 
                      src={imageUrls[scene.id]} 
                      alt={scene.description}
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                      loading="lazy"
                      onError={(e) => {
                        // Sistem Cadangan Otomatis jika API server AI sedang penuh / lambat
                        e.target.src = `https://loremflickr.com/280/210/miniature,toy?random=${scene.id}`;
                      }}
                    />
                  ) : (
                    <div className="text-zinc-700 flex flex-col items-center gap-1.5 p-4 text-center">
                      <ImageIcon size={16} className="text-amber-500/30" />
                      <span className="text-[8px] uppercase tracking-widest text-zinc-700">Antrean...</span>
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
