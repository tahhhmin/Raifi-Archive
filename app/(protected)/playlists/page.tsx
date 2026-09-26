import styles from '@/app/(protected)/playlists/page.module.css'
import { ArrowUpRight } from 'lucide-react'

export default function page() {
    return (
        <main>
            <section className={styles.section}>
                <span>Our Spotify Blend</span>

                <button>
                    <ArrowUpRight />
                    Open Spotify
                </button>
            </section>
        </main>
    )
}
