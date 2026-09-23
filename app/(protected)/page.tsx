import styles from "@/app/(protected)/page.module.css";

import DayCounter from "@/components/home/dayCounter/dayCounter";
import MoodCheck from "@/components/home/moodCheck/MoodCheck";

export default function Home() {
    return (
        <main className={styles.main}>
            <DayCounter/>
            <MoodCheck/>
            <div className={styles.smth}>
                <p>something</p>
            </div>
        </main>
    );
}