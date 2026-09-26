"use client";

import { useState } from "react";
import {
    Angry,
    Frown,
    Meh,
    Smile,
    Laugh,
    Heart,
} from "lucide-react";

import styles from "@/components/home/moodCheck/MoodCheck.module.css";

const moods = [
    { label: "Angry", icon: Angry },
    { label: "Sad", icon: Frown },
    { label: "Okay", icon: Meh },
    { label: "Happy", icon: Smile },
    { label: "Excited", icon: Laugh },
    { label: "Loved", icon: Heart },
];

export default function MoodCheck() {
    const [sending, setSending] = useState<string | null>(null);

    async function handleMoodClick(mood: string) {
        setSending(mood);
        try {
            const res = await fetch("/api/moodCheck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mood }),
            });

            if (!res.ok) {
                const data = await res.json();
                console.error("Failed to send mood:", data.error);
            }
        } catch (err) {
            console.error("Error sending mood:", err);
        } finally {
            setSending(null);
        }
    }

    return (
        <div className={styles.container}>
            {moods.map((mood) => {
                const Icon = mood.icon;

                return (
                    <button
                        key={mood.label}
                        type="button"
                        className={styles.button}
                        aria-label={`Feeling ${mood.label}`}
                        disabled={sending === mood.label}
                        onClick={() => handleMoodClick(mood.label)}
                    >
                        <Icon size={36} strokeWidth={1.24} />
                        <span>{mood.label}</span>
                    </button>
                );
            })}
        </div>
    );
}