"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { 
    Home, CalendarDays, Clapperboard, Music, ListChecks, Mailbox,
    Heart, Camera, Gamepad2, Flower, BookUser, LoaderPinwheel, MessageCircleHeart,
} from "lucide-react";

import styles from "@/components/header/header.module.css";

export default function Header() {
    const [expanded, setExpanded] = useState(false);

    const toggleMenu = () => {
        setExpanded((prev) => !prev);
    };

    const pathname = usePathname();
    const router = useRouter();

    const pages = [
        {path: "/", label: "Home", icon: Home},
        {path: "/calendar", label: "Calendar", icon: CalendarDays},
        {path: "/movie-list", label: "Movie List", icon: Clapperboard},
        {path: "/music-playlists", label: "Music Playlists", icon: Music},
        {path: "/mailbox", label: "Mailbox", icon: Mailbox},
        {path: "/bucketlist", label: "Bucketlist", icon: ListChecks},
        {path: "/date-ideas", label: "Date Ideas", icon: Heart},
        {path: "/photobooth", label: "Photobooth", icon: Camera},
        {path: "/chat", label: "Chat", icon: MessageCircleHeart,},
        {path: "/games", label: "Games", icon: Gamepad2},
        {path: "/garden", label: "Garden", icon: Flower},
        {path: "/spin-the-wheel", label: "Spin The Wheel", icon: LoaderPinwheel},
        {path: "/profile", label: "Profile", icon: BookUser},
    ];

    const currentPage = pages.find((page) => page.path === pathname) || pages[0];
    const otherPages = pages.filter((page) => page.path !== currentPage.path);

    const handleNavigate = (path: string) => {router.push(path);
        setExpanded(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.topRow}>
                <div className={styles.button}>
                    <div className={styles.circles}>
                        <div className={styles.circle}></div>
                        <div className={styles.circle}></div>
                        <div className={styles.circle}></div>
                    </div>
                    <button
                        className={styles.navButton}
                        onClick={toggleMenu}
                        aria-expanded={expanded}
                        aria-label="Open navigation menu"
                    >
                        <span className={styles.currentPage}>{currentPage.label}</span>
                    </button>
                </div>
                <Link href="/" className={styles.title}>
                    <p>Raifi.archive</p>
                </Link>
            </div>
            {expanded && (
                <div className={styles.expandedMenu}>
                    {otherPages.map((page) => {
                        const Icon = page.icon;
                        return (
                            <button
                                key={page.path}
                                onClick={() => handleNavigate(page.path)}
                                className={styles.menuButton}
                            >
                                <span>{page.label}</span>
                                <Icon size={22} strokeWidth={1.8}/>
                            </button>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
