"use client";

import { useState, useEffect } from "react";
import styles from "./dayCounter.module.css";

interface TimeTogether {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function dayCounter() {
    const [timeTogether, setTimeTogether] = useState<TimeTogether>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const startDate = new Date("2024-12-08T17:53:00"); // moved inside useEffect

        const interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startDate.getTime();

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeTogether({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, []); 

    return (
        <div className={styles.counterContainer}>
        <p className={styles.date}>Since: 08 / December / 24, 5:53 PM</p>
        <div className={styles.counter}>
            <p className={styles.days}>{timeTogether.days} Days</p>
            <p>-</p>
            <p className={styles.time}>
            {timeTogether.hours}h : {timeTogether.minutes}m : {timeTogether.seconds}s
            </p>
        </div>
        </div>
    );
}