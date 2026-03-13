import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Joel Tecson | Senior Software Engineer',
  description: 'Professional portfolio of Joel Tecson, a Senior Software Engineer specializing in Payment Systems, AI/RAG, and Healthcare.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-brand-dark text-brand-text antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
