import styles from "@/app/(protected)/page.module.css";
import DayCounter from "@/components/home/dayCounter/DayCounter";
import MoodCheck from "@/components/home/moodCheck/MoodCheck";
import WeatherIndicator from "@/components/home/weatherIndicator/WeatherIndicator";
import MailBox from "@/components/home/mailBox/MailBox";

export default function Home() {
    return (
        <main className={styles.main}>
            <DayCounter/>
            <MoodCheck />
            <WeatherIndicator />
            <MailBox />
        </main>
    );
}