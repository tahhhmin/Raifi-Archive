import styles from "@/app/(protected)/page.module.css";
import DayCounter from "@/components/home/dayCounter/DayCounter";
import MoodCheck from "@/components/home/moodCheck/MoodCheck";
import WeatherIndicator from "@/components/home/WeatherIndicator/WeatherIndicator";

export default function Home() {
    return (
        <main className={styles.main}>
            <DayCounter/>
            <MoodCheck />
            <WeatherIndicator />
        </main>
    );
}