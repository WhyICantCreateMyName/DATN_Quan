import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Titan Gym | Nơi Đánh Thức Sức Mạnh",
  description: "Trải nghiệm hệ thống phòng tập đẳng cấp 5 sao.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navigation />
          <main className="flex-1 pt-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
