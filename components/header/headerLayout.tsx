"use client"

import Header from '@/components/header/header'
import { usePathname } from 'next/navigation';

export default function HeaderLayout() {
    const pathname = usePathname();
    const showHeader = pathname !== '/login';

    return (
                <>
            {showHeader && <Header />}
        </>
    )
}