import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/themes.css";
import { NavigationWrapper } from "@/components/common/NavigationWrapper";
import NotificationProviderClient from "@/components/common/NotificationProviderClient";
import ApolloWrapper from "@/components/common/ApolloWrapper";
import { ReduxProvider } from "../../store/Provider";
import { ThemeProvider } from "../contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kozeo",
  description: "Ignore The Noise, Hire With Purpose",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Kozeo",
              url: "/",
              description:
                "Kozeo is a proof-first career platform for tech professionals to build verifiable portfolios through Speedruns, Work Sprints, and Projects.",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased theme-transition`}
        suppressHydrationWarning
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
