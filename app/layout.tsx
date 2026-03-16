import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickWork",
  description: "QuickWork is a platform connecting users (Customers) with companies for home improvement jobs, vetted by Experts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("quickwork_theme")?.value as "light" | "dark" | "system") || "system";
  const themeClass = theme === "dark" ? "dark" : theme === "light" ? "" : undefined;

  return (
    <html lang="de" className={themeClass} suppressHydrationWarning>
      <head>
        {theme === "system" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var m=window.matchMedia('(prefers-color-scheme: dark)');document.documentElement.classList.toggle('dark',m.matches);m.addEventListener('change',function(e){document.documentElement.classList.toggle('dark',e.matches);});})();`,
            }}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
