import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: 'swap',
  weight: ['500', '600', '700'],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: "HTK Enterprises | Organic & Corporate Luxury",
  description: "Premium organic honey, turmeric, and country sugar. Corporate gifting solutions. 3 years of trust. Ships globally from Dindigul, India.",
  keywords: ["organic honey India", "corporate gifts", "natural products", "sustainable farming", "women-led enterprise", "HTK Enterprises"],
  openGraph: {
    title: "HTK Enterprises - Nature's Purity, Professionally Delivered",
    description: "Premium organic products and corporate gifting solutions from India",
    url: "https://www.htkenterprises.net",
    siteName: "HTK Enterprises",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTK Enterprises - Organic Products & Corporate Gifts",
    description: "Premium organic products and corporate gifting solutions from India",
  },
  alternates: {
    canonical: "https://www.htkenterprises.net",
  },
};

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import CartDrawer from "@/components/CartDrawer";
import LuxuryBackground from "@/components/LuxuryBackground";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatBot from "@/components/ChatBot";
import StructuredData from "@/components/StructuredData";

import NewsletterPopup from '@/components/NewsletterPopup';
import GoogleAnalytics from '@/components/GoogleAnalytics';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <GoogleAnalytics gaId="G-MEASUREMENT_ID" />
      <StructuredData />
      <body className="font-sans antialiased bg-[var(--color-background)] text-[var(--color-text)] overflow-x-hidden selection:bg-[var(--color-primary)] selection:text-white">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <WishlistProvider>
                <LuxuryBackground />
                <Navigation />
                <CartDrawer />
                <main id="main-content">
                  {children}
                </main>
                <NewsletterPopup />
                <ChatBot />
                <WhatsAppButton />
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

