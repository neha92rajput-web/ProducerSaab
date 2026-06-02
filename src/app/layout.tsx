import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProducerSaab | Elite Music Creator Community",
  description: "Connect, collaborate, and discover elite producers, artists, and sound designers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FAF9F5]">
        {children}
      </body>
    </html>
  );
}
// Force full platform rebuild sequence
