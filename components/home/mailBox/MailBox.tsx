import styles from '@/components/home/mailBox/Mailbox.module.css'
import { Mailbox, MailBadge } from 'lucide-react'

export default function MailBox() {
    return (
        <div className={styles.container}>
            <MailBadge size={96} strokeWidth={1.15} />
            <Mailbox />
        </div>
    )
}
