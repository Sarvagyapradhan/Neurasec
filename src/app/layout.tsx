import "./globals.css";
import "./custom.css";
import { Inter } from "next/font/google";
import SimpleNavbar from "@/components/SimpleNavbar";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata = {
  title: "NeuraSec - Enterprise-Grade AI-Powered Cybersecurity Platform",
  description: "Advanced AI-powered cybersecurity platform providing real-time threat detection, comprehensive security analysis, and protection against zero-day exploits",
  keywords: "cybersecurity, AI security, threat detection, zero-day protection, enterprise security, NeuraSec",
  authors: [{ name: "NeuraSec Team" }],
  creator: "NeuraSec",
  metadataBase: new URL("https://neurasec.ai"),
  openGraph: {
    title: "NeuraSec - Enterprise-Grade AI-Powered Cybersecurity Platform",
    description: "Advanced AI-powered cybersecurity platform providing real-time threat detection, comprehensive security analysis, and protection against zero-day exploits",
    url: "https://neurasec.ai",
    siteName: "NeuraSec",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NeuraSec - AI-Powered Cybersecurity",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuraSec - Enterprise-Grade AI-Powered Cybersecurity Platform",
    description: "Advanced AI-powered cybersecurity platform providing real-time threat detection and protection",
    images: ["/twitter-image.jpg"],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <SimpleNavbar />
            <main className="pt-16 flex-grow bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 bg-opacity-90">
              {children}
            </main>
            <footer className="py-6 bg-slate-950 border-t border-slate-800">
              <div className="container mx-auto text-center text-sm text-slate-500">
                <p>© {new Date().getFullYear()} NeuraSec. All rights reserved.</p>
              </div>
            </footer>
          </div>
          <Toaster position="bottom-right" toastOptions={{ 
            duration: 4000,
            className: "!bg-slate-900 !text-slate-100 !border !border-slate-800 !shadow-lg" 
          }} />
        </AuthProvider>
      </body>
    </html>
  );
} 