"use client";

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
    { label: "Angry", icon: Angry},
    {label: "Sad", icon: Frown},
    {label: "Okay", icon: Meh},
    {label: "Happy", icon: Smile},
    {label: "Excited", icon: Laugh},
    {label: "Loved", icon: Heart},
];

export default function MoodCheck() {
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
                    >
                        <Icon size={36} strokeWidth={1.24}/>
                        <span>{mood.label}</span>

                    </button>
                );
            })}
        </div>
    );
}

