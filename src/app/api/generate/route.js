import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt tidak boleh kosong" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key Gemini belum dikonfigurasi di Vercel" }, { status: 500 });
    }

    // Menggunakan endpoint v1beta langsung ke model stabil gemini-1.5-flash-latest tanpa library SDK
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

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
            "image_placeholder_query": "one single simple english keyword for the main object in this scene",
            "description": "DESKRIPSI VISUAL ADEGAN DALAM HURUF KAPITAL",
            "sfx": "DETAIL EFEK SUARA DALAM HURUF KAPITAL (misal: KLIK LEGO)"
          }
        ]
      }
      Buatlah adegan yang padat (antara 6 sampai 8 scene) dengan pembagian timestamp yang presisi dan logis sesuai durasi total video.
    `;

    // Request langsung menggunakan HTTP Fetch standar bawaan Node.js
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gagal memanggil API Google");
    }

    const resData = await response.json();
    
    // Proteksi ekstra untuk mengambil teks respons teks AI
    if (!resData.candidates || !resData.candidates[0]?.content?.parts[0]?.text) {
      throw new Error("Format respon API Google di luar dugaan");
    }
    
    const responseText = resData.candidates[0].content.parts[0].text;

    // Bersihkan penanda markdown string JSON jika ada
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
