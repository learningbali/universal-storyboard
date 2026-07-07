import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt tidak boleh kosong" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key belum terpasang di Vercel" }, { status: 500 });
    }

    // Menggunakan model stabil paling mutakhir google
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const fullPrompt = `
      Anda adalah sutradara video pendek profesional untuk platform TikTok/Reels/Shorts. Tugas Anda membuat skrip storyboard terstruktur berdasarkan ide user.
      
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
            "image_placeholder_query": "SATU KATA KUNCI OBJEK UTAMA DALAM BAHASA INGGRIS SAJA (misal: lego, car, unboxing, wheel, engine)",
            "description": "DESKRIPSI VISUAL ADEGAN DALAM HURUF KAPITAL",
            "sfx": "DETAIL EFEK SUARA DALAM HURUF KAPITAL (misal: KLIK LEGO)"
          }
        ]
      }
      Buatlah adegan yang padat (antara 6 sampai 8 scene) dengan pembagian timestamp yang presisi dan logis sesuai durasi total video.
    `;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gagal memanggil API Google");
    }

    const resData = await response.json();
    const responseText = resData.candidates[0].content.parts[0].text;

    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const storyboardData = JSON.parse(cleanedText);
    return NextResponse.json(storyboardData);
  } catch (error) {
    console.error("Gemini Rest API Error:", error);
    return NextResponse.json({ error: "Gagal memproses AI: " + error.message }, { status: 500 });
  }
}
