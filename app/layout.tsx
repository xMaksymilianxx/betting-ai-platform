import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Betting AI Platform - Zaawansowane Typy Sportowe',
  description: 'Najlepsza platforma AI do analiz sportowych i typowania bukmacherskiego',
  keywords: 'typy sportowe, AI, machine learning, bukmacherstwo, analiza sportowa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    🎯 Betting AI
                  </h1>
                  <div className="hidden md:flex space-x-6">
                    <a href="/" className="text-slate-300 hover:text-white transition">Dashboard</a>
                    <a href="/matches" className="text-slate-300 hover:text-white transition">Mecze</a>
                    <a href="/predictions" className="text-slate-300 hover:text-white transition">Predykcje</a>
                    <a href="/history" className="text-slate-300 hover:text-white transition">Historia</a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                    🟢 Live
                  </span>
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
