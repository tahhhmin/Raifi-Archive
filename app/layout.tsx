import type { Metadata } from "next";
import { Lora, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

import HeaderLayout from "@/components/header/headerLayout";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
    title: "Raifi.archive",
    description: "A website just for us<3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`${lora.variable} ${geistMono.variable} h-full antialiased`}>
            <body>
                <HeaderLayout/>
                {children}
            </body>
        </html>
    );
}
