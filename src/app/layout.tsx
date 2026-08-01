import React from "react";
import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import "../styles/themes.css";
import { NavigationWrapper } from "@/components/common/NavigationWrapper";
import NotificationProviderClient from "@/components/common/NotificationProviderClient";
import ApolloWrapper from "@/components/common/ApolloWrapper";
import { ReduxProvider } from "../../store/Provider";
import { ThemeProvider } from "../contexts/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kozeo - Build Your Tech Portfolio with Real-World Projects",
    template: "%s | Kozeo",
  },
  description:
    "Kozeo empowers computer science students and developers with real-world paid projects from startups and passion projects. Build your portfolio, gain practical experience, earn while learning, and grow your professional network.",
  keywords: [
    "freelance development",
    "computer science projects",
    "developer portfolio",
    "coding jobs",
    "tech internships",
    "startup projects",
    "NGO development",
    "software development",
    "web development",
    "mobile app development",
    "programming jobs",
    "developer community",
    "coding bootcamp",
    "tech career",
    "remote development work",
    "student projects",
    "professional networking",
    "skill development",
    "real-world experience",
    "collaborative coding",
    "resume builder",
  ],
  authors: [{ name: "Kozeo Team" }],
  creator: "Kozeo",
  publisher: "Kozeo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.kozeo.in"),
  alternates: {
    canonical: "https://www.kozeo.in",
    languages: {
      "en-IN": "https://www.kozeo.in",
      en: "https://www.kozeo.in",
    },
  },
  openGraph: {
    title: "Kozeo - Build Your Tech Portfolio with Real-World Projects",
    description:
      "Join thousands of developers building their careers with real-world paid projects. Work on meaningful projects while earning and building your professional portfolio.",
    url: "https://www.kozeo.in",
    siteName: "Kozeo",
    images: [
      {
        url: "/kozeoLogo.png",
        width: 1200,
        height: 630,
        alt: "Kozeo - Professional Development Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozeo - Build Your Tech Portfolio with Real-World Projects",
    description:
      "Join thousands of developers building their careers with real-world paid projects. Work on meaningful projects while earning and building your professional portfolio.",
    images: ["/kozeoLogo.png"],
    creator: "@kozeo",
    site: "@kozeo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code-here",
    yandex: "yandex-verification-code-here",
  },
  category: "Technology",
  classification: "Professional Development Platform",
  referrer: "origin-when-cross-origin",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "var(--forge-ink)" },
    { media: "(prefers-color-scheme: dark)", color: "var(--forge-bg)" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "application-name": "Kozeo",
    "mobile-web-app-capable": "yes",
    "mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Kozeo",
    "msapplication-TileColor": "var(--forge-bg)",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "var(--forge-bg)",

    // Geo targeting
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "20.5937;78.9629",
    ICBM: "20.5937,78.9629",
    "geo.country": "IN",

    // AI accessibility
    "openai-domain-verification": "dv-your-actual-verification-code",
    "anthropic-access": "allowed",
    "ai-content-declaration": "human-authored",
    "chatgpt-plugin": "enabled",
    "claude-access": "enabled",
    "bard-access": "enabled",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;700&display=swap"
          rel="stylesheet"
        />

        {/* Additional SEO meta tags */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* AI and Search Engine hints */}
        <meta name="allow-search" content="yes" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="worldwide" />
        <meta name="directory" content="submission" />
        <meta name="rating" content="safe for kids" />
        <meta name="subject" content="Professional Development Platform" />
        <meta
          name="summary"
          content="Kozeo helps developers build their portfolio through real-world projects"
        />
        <meta
          name="topic"
          content="Developer Platform, Portfolio Building, Freelance Development"
        />
        <meta name="url" content="https://www.kozeo.in" />
        <meta name="identifier-URL" content="https://www.kozeo.in" />
        <meta
          name="category"
          content="Technology, Education, Professional Development"
        />
        <meta name="reply-to" content="support@kozeo.in" />
        <meta name="owner" content="Kozeo Team" />
        <meta name="classification" content="Business" />
        <meta name="designer" content="Kozeo Design Team" />
        <meta name="copyright" content="Kozeo" />
        <meta name="author" content="Kozeo Team" />
        <meta
          name="abstract"
          content="Professional development platform for developers"
        />

        {/* AI Crawler accessibility */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="bingbot" content="index, follow" />
        <meta name="slurp" content="index, follow" />
        <meta name="facebookexternalhit" content="index, follow" />
        <meta name="twitterbot" content="index, follow" />
        <meta name="linkedinbot" content="index, follow" />
        <meta name="whatsapp" content="index, follow" />

        {/* AI Model accessibility */}
        <meta name="ai-accessibility" content="public" />
        <meta name="crawl-delay" content="1" />
        <meta name="data-vocabulary" content="https://schema.org" />

        {/* Dublin Core metadata */}
        <meta
          name="DC.title"
          content="Kozeo - Build Your Tech Portfolio with Real-World Projects"
        />
        <meta name="DC.creator" content="Kozeo Team" />
        <meta
          name="DC.subject"
          content="Developer Platform, Portfolio Building, Freelance Development"
        />
        <meta
          name="DC.description"
          content="Professional development platform for developers and computer science students"
        />
        <meta name="DC.publisher" content="Kozeo" />
        <meta name="DC.contributor" content="Kozeo Team" />
        <meta name="DC.date" content="2024" />
        <meta name="DC.type" content="Service" />
        <meta name="DC.format" content="text/html" />
        <meta name="DC.identifier" content="https://www.kozeo.in" />
        <meta name="DC.language" content="en" />
        <meta name="DC.coverage" content="India, Global" />
        <meta name="DC.rights" content="© 2024 Kozeo. All rights reserved." />

        {/* Structured data for organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Kozeo",
              url: "https://www.kozeo.in",
              logo: "https://www.kozeo.in/kozeoLogo.png",
              description:
                "Professional development platform connecting developers with real-world projects",
              foundingDate: "2024",
              areaServed: {
                "@type": "Country",
                name: "India",
              },
              sameAs: [
                "https://twitter.com/kozeo",
                "https://linkedin.com/company/kozeo",
                "https://github.com/kozeo",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                url: "https://www.kozeo.in/contact",
                email: "support@kozeo.in",
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
              },
            }),
          }}
        />

        {/* Structured data for website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Kozeo",
              url: "https://www.kozeo.in",
              description: "Build your tech portfolio with real-world projects",
              inLanguage: "en-IN",
              publisher: {
                "@type": "Organization",
                name: "Kozeo",
                url: "https://www.kozeo.in",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.kozeo.in/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* WebApplication structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Kozeo Platform",
              url: "https://www.kozeo.in",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              featureList: [
                "Real-world project collaboration",
                "Portfolio building",
                "Professional networking",
                "Skill development",
                "Freelance opportunities",
                "Discussion rooms",
                "Job opportunities",
                "Coding contests",
              ],
              audience: {
                "@type": "Audience",
                audienceType: "Developers, Students, Freelancers",
              },
            }),
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${plexMono.variable} ${fraunces.variable} antialiased theme-transition font-sans`}
      >
        <ReduxProvider>
          <ApolloWrapper>
            <ThemeProvider>
              <NotificationProviderClient>
                <NavigationWrapper>{children}</NavigationWrapper>
              </NotificationProviderClient>
            </ThemeProvider>
          </ApolloWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
