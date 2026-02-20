import "./globals.css";
import type { Metadata } from "next";
import { NavigationBar } from "@/components/Navigation";

export const metadata: Metadata = {
  title: {
    default: "AWS Cloud Club LPU | Learn Cloud Computing & AWS at Lovely Professional University",
    template: "%s | AWS Cloud Club LPU",
  },

  description:
    "AWS Cloud Club at Lovely Professional University (LPU) is a student-led technical community focused on cloud computing, AWS certifications, hands-on labs, hackathons, and industry-ready skills.",

  keywords: [
    "AWS Cloud Club LPU",
    "AWS Student Club India",
    "Cloud Computing LPU",
    "AWS Workshops LPU",
    "AWS Certifications Students",
    "Cloud Computing Community India",
    "AWS Student Community",
    "LPU Tech Club",
    "AWS Learning Community",
  ],

  authors: [{ name: "AWS Cloud Club LPU" }],
  creator: "AWS Cloud Club LPU",
  publisher: "AWS Cloud Club LPU",

  metadataBase: new URL("https://awslpu.in"),

  openGraph: {
    title: "AWS Cloud Club LPU",
    description:
      "Join AWS Cloud Club LPU to learn cloud computing, build real-world projects, attend workshops, and grow with a community of cloud engineers.",
    url: "https://awslpu.in",
    siteName: "AWS Cloud Club LPU",
    images: [
      {
        url: "/og-image.png", // add later
        width: 1200,
        height: 630,
        alt: "AWS Cloud Club LPU",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AWS Cloud Club LPU",
    description:
      "Student-led AWS cloud computing community at Lovely Professional University.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://awslpu.in",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>

      <body className="relative min-h-screen font-sans antialiased overflow-x-hidden">
        <NavigationBar />
        <main>{children}</main>
      </body>
    </html>
  );
}


