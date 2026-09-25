import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "@/app/globals.css";

import ThemeProvider from "@/components/ThemeProvider";
import HeaderLayout from "@/components/header/headerLayout";

const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Raifi.archive",
    description: "A website just for us<3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html   lang="en" suppressHydrationWarning 
                className={`${lora.variable} ${inter.variable} 
                h-full antialiased`}
        >
            <body>
                <ThemeProvider>
                    <HeaderLayout/>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
