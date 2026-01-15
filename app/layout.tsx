import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import {
  createTheme,
  MantineColorsTuple,
  MantineProvider,
} from "@mantine/core";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SohCahToa Payout BDC",
  description: "SohCahToa Payout BDC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const myColor: MantineColorsTuple = [
    "#fff0e4",
    "#ffe0ce",
    "#fdbe9e",
    "#fb9b69",
    "#f97d3c",
    "#f96a20",
    "#f96011",
    "#dd4f05",
    "#c64501",
    "#ad3900",
  ];
  const theme = createTheme({
    colors: {
      myColor,
    },
    primaryColor: "myColor",
    primaryShade: 4,
  });
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </MantineProvider>
  );
}
