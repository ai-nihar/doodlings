import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

import { prisma } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const business = await prisma.business.findFirst({
      where: { is_active: true },
    });

    if (business) {
      return {
        title: business.name.trim(),
        description: business.tagline ? `${business.name.trim()} — ${business.tagline.trim()}` : `${business.name.trim()} Digital Business Card`,
        icons: {
          icon: business.profile_image_url || "/favicon.ico",
          shortcut: business.profile_image_url || "/favicon.ico",
          apple: business.profile_image_url || "/favicon.ico",
        },
      };
    }
  } catch (error) {
    console.error("Failed to generate dynamic metadata:", error);
  }

  return {
    title: "Rexon Hydraulics Pvt Ltd",
    description: "Rexon Hydraulics Pvt Ltd — Precision Hydraulic Solutions.",
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full scroll-smooth`}>
      <head>
        {/* Font Awesome 6 */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          precedence="default"
        />
      </head>
      <body className="antialiased min-h-screen text-slate-800">
        {children}
      </body>
    </html>
  );
}
