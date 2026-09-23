import type { Metadata } from "next";
import { Geist_Pixel, Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

import HeaderLayout from "@/components/header/headerLayout";

const GeistPixel = Geist_Pixel({
    variable: "--font-geist-pixel",
    subsets: ["latin"],
});

const GeistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const GeistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Raifi.archive",
    description: "",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`
        ${GeistPixel.variable} 
        ${GeistSans.variable} 
        ${GeistMono.variable} 
        h-full antialiased`}
        >
            <body>
                <HeaderLayout/>
                {children}
            </body>
        </html>
    );
}
