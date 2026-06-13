import { Inter, Outfit, Kelly_Slab } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const kellySlab = Kelly_Slab({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kelly-slab",
});

export const metadata = {
  title: "Ghatal Guide - Modern City Companion & Business Directory",
  description: "Discover local businesses, services, emergency helplines, bus schedules, events, and jobs in Ghatal. The complete guide to Ghatal town.",
  keywords: [
    "Ghatal", "Ghatal Guide", "Ghatal Town", "Ghatal Business Directory", 
    "Ghatal Services", "Ghatal Bus Timetable", "Doctors in Ghatal", 
    "Hospitals in Ghatal", "Ghatal Emergency Numbers", "Ghatal Local Guide",
    "Ghatal News", "Ghatal Jobs", "Ghatal Events", "West Bengal local guide"
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  other: {
    "google-site-verification": "4oeMta9U50PqoMD7Nxhp5tY2Khykak0dcGAd36Mv_bk",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Ghatal Guide - Modern City Companion & Business Directory",
    description: "Discover local businesses, emergency numbers, bus schedules, events, and jobs in Ghatal.",
    url: "https://ghatalguide.netlify.app/",
    siteName: "Ghatal Guide",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Ghatal Guide Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ghatal Guide - Modern City Companion & Business Directory",
    description: "Discover local services, emergency contacts, bus schedules, events, and jobs in Ghatal.",
    images: ["/logo.png"],
  },
};

export const viewport = {
  themeColor: "#1e3a8a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${kellySlab.variable} h-full antialiased`} suppressHydrationWarning>
      <head />
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem("darkMode");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (storedTheme === "true" || (storedTheme === null && prefersDark)) {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (e) {}
            `,
          }}
        />
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
