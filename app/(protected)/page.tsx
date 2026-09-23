import styles from "@/app/(protected)/page.module.css";

import DayCounter from "@/components/home/dayCounter/dayCounter";
import MoodCheck from "@/components/home/moodCheck/MoodCheck";

export default function Home() {
    return (
        <main>
            <DayCounter/>
            <MoodCheck/>
        </main>
    );
}