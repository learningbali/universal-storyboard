import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt tidak boleh kosong" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Gabungkan instruksi sistem langsung ke dalam prompt utama agar kompatibel dengan versi SDK lama
    const fullPrompt = `
      Anda adalah sutradara video pendek profesional untuk platform TikTok/Reels. Tugas Anda adalah membuat skrip storyboard terstruktur berdasarkan ide dari user.
      
      Ide video dari user: "${prompt}"

      PENTING: Anda WAJIB membalas HANYA dengan format JSON murni tanpa markdown, tanpa tanda \`\`\`json ataupun tag pembungkus lainnya. Jangan ketik teks penjelasan apa pun di luar JSON!
      
      Struktur JSON harus persis seperti ini:
      {
        "title": "JUDUL BESAR UTAMA (misal: ASMR MERAKIT LEGO)",
        "subtitle": "SUBJUDUL DETAIL (misal: MITSUBISHI PAJERO DAKKAR)",
        "duration": "DURASI TOTAL (misal: DURASI 10 DETIK)",
        "ratio": "ASPEK RASIO 9:16",
        "footer_notes": ["ASMR MURNI", "GUNAKAN HEADPHONE", "RELAX & ENJOY"],
        "scenes": [
          {
            "id": 1,
            "timestamp": "0.00 - 1.20",
            "image_placeholder_query": "kata kunci gambar spesifik dalam bahasa inggris",
            "description": "DESKRIPSI VISUAL ADEGAN DALAM HURUF KAPITAL",
            "sfx": "DETAIL EFEK SUARA DALAM HURUF KAPITAL (misal: KLIK LEGO)"
          }
        ]
      }
      Buatlah adegan yang padat (antara 6 sampai 8 scene) dengan pembagian timestamp yang presisi dan logis sesuai durasi total video.
    `;

    // Hapus configuration yang memicu error di SDK versi lama
    const result = await model.generateContent(fullPrompt);

    const responseText = result.response.text();
    
    // Bersihkan teks jika AI tidak sengaja memberikan format markdown ```json ... ```
    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const storyboardData = JSON.parse(cleanedText);

    return NextResponse.json(storyboardData);
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Gagal memproses AI: " + error.message }, { status: 500 });
  }
}
