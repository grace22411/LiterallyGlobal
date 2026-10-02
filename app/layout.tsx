import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LiterallyGlobal | Global Talent Endorsement Support",
    template: "%s | LiterallyGlobal",
  },
  description:
    "Turn your achievements into a compelling Global Talent endorsement application. Personal support for digital technology, academia and research, and design applicants.",
  openGraph: {
    title: "LiterallyGlobal — Your talent. A bigger world.",
    description:
      "UK Global Talent endorsement support. Find the right next step, from a one-hour consultation to hands-on application support.",
    type: "website",
    locale: "en_GB",
    siteName: "LiterallyGlobal",
  },
};

export const viewport: Viewport = { themeColor: "#fbf8f1" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
