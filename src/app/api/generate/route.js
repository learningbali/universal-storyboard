import { GoogleGenAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inisialisasi Google AI dengan API Key dari Environment Variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt tidak boleh kosong" }, { status: 400 });
    }

    // Menggunakan model Gemini terbaru
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = `
      Anda adalah sutradara video pendek profesional untuk platform TikTok/Reels. Tugas Anda adalah membuat skrip storyboard terstruktur berdasarkan ide user.
      Anda WAJIB membalas HANYA dengan format JSON murni tanpa markdown, tanpa tanda \`\`\`json.
      
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
            "image_placeholder_query": "kata kunci gambar unboxing lego",
            "description": "DESKRIPSI VISUAL ADEGAN DALAM HURUF KAPITAL",
            "sfx": "DETAIL EFEK SUARA DALAM HURUF KAPITAL (misal: KLIK LEGO)"
          }
        ]
      }
      Buatlah adegan yang padat (antara 6 sampai 8 scene) dengan pembagian timestamp yang presisi dan logis sesuai durasi total.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      systemInstruction: systemInstruction
    });

    const responseText = result.response.text();
    const storyboardData = JSON.parse(responseText);

    return NextResponse.json(storyboardData);
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Gagal memproses AI: " + error.message }, { status: 500 });
  }
}
