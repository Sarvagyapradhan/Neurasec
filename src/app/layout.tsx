import "./globals.css";
import "./custom.css";
import { Inter } from "next/font/google";
import SimpleNavbar from "@/components/SimpleNavbar";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "sonner";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
            <main className="pt-16 flex-grow bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 bg-opacity-90 pb-[env(safe-area-inset-bottom)]">
              {children}
            </main>
            <footer className="bg-slate-950 border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
                  <div className="col-span-2 lg:col-span-1 text-center md:text-left">
                    <div className="text-slate-100 font-semibold">NeuraSec</div>
                    <p className="mt-2 text-sm text-slate-400">
                      Security tools with per-user scan history and real-time analysis.
                    </p>
                  </div>

                  <div className="text-center md:text-left">
                    <div className="text-slate-200 text-sm font-semibold">Product</div>
                    <div className="mt-3 space-y-1 text-sm">
                      <Link className="block rounded-md px-2 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60" href="/dashboard">Dashboard</Link>
                      <Link className="block rounded-md px-2 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60" href="/scans">Scan history</Link>
                      <Link className="block rounded-md px-2 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60" href="/settings">Settings</Link>
                    </div>
                  </div>

                  <div className="text-center md:text-left">
                    <div className="text-slate-200 text-sm font-semibold">Tools</div>
                    <div className="mt-3 space-y-1 text-sm">
                      <Link className="block rounded-md px-2 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60" href="/url-scanner">URL scanner</Link>
                      <Link className="block rounded-md px-2 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60" href="/email-analyzer">Email analyzer</Link>
                      <Link className="block rounded-md px-2 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60" href="/file-scanner">File scanner</Link>
                    </div>
                  </div>

                  <div className="text-center md:text-left">
                    <div className="text-slate-200 text-sm font-semibold">Account</div>
                    <div className="mt-3 space-y-1 text-sm">
                      <Link className="block rounded-md px-2 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60" href="/login">Log in</Link>
                      <Link className="block rounded-md px-2 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60" href="/register">Sign up</Link>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col items-center gap-2 md:flex-row md:items-center md:justify-between border-t border-slate-800 pt-6 text-center md:text-left">
                  <div className="text-xs text-slate-500">
                    © {new Date().getFullYear()} NeuraSec. All rights reserved.
                  </div>
                  <div className="text-xs text-slate-500">
                    Built with Next.js • Responsive on mobile, tablet, and desktop
                  </div>
                </div>
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