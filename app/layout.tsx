import type { Metadata } from "next";
import { DM_Mono, Syne } from "next/font/google";
import { Providers } from "@/components/Providers";
import { getI18n, getLocale } from "@/lib/i18n/server";
import "./globals.css";

const mono = DM_Mono({
  weight: ["300", "400"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const syne = Syne({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-syne",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.title, description: t.meta.description };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning className={`${mono.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}