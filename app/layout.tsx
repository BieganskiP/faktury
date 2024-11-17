import type { Metadata } from "next";
import "@/app/assets/globals.css";

export const metadata: Metadata = {
  title: "Generator faktur",
  description: "Generator faktur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
