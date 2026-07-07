import "./globals.css";

export const metadata = {
  title: "AI Universal Storyboard",
  description: "Generate video storyboards instantly using Google Gemini",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body class="antialiased">{children}</body>
    </html>
  );
}
