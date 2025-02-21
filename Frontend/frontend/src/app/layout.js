import localFont from "next/font/local";
import "./globals.css";
import { Questrial } from 'next/font/google'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Don't Twin!",
  description: "A unique game where you try not to match the AI's answers",
  icons: {
    icon: '/favicon.ico',  // Place your favicon in the public folder
  },
};

const questrial = Questrial({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
