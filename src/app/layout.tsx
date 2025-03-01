import type { Metadata } from "next";
import ThemeProvider from "@/components/Theme/Provider";
import I18Provider from "@/components/I18nProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Deep Research",
  description: "Deep Rssearch with Google Gemini Models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18Provider>{children}</I18Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
