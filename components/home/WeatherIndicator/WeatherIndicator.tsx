'use client'

import { useEffect, useState } from 'react'
import styles from '@/components/home/weatherIndicator/WeatherIndicator.module.css'

const LOCATIONS = [
    { name: 'Dhaka', latitude: 23.8103, longitude: 90.4125 },
    { name: 'Bogura', latitude: 24.8465, longitude: 89.3773 },
]

const WEATHER_CODES: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mostly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Violent showers',
    95: 'Thunderstorm',
}

interface WeatherData {
    name: string
    temperature: number
    weatherCode: number
    isDay: boolean
}

export default function WeatherIndicator() {
    const [weatherList, setWeatherList] = useState<WeatherData[] | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        const controller = new AbortController()

        async function fetchOne(loc: (typeof LOCATIONS)[number]): Promise<WeatherData> {
            const url = new URL('https://api.open-meteo.com/v1/forecast')
            url.searchParams.set('latitude', String(loc.latitude))
            url.searchParams.set('longitude', String(loc.longitude))
            url.searchParams.set('current', 'temperature_2m,weather_code,is_day')

            const res = await fetch(url.toString(), { signal: controller.signal })
            if (!res.ok) throw new Error('Weather request failed')

            const data = await res.json()
            return {
                name: loc.name,
                temperature: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code,
                isDay: data.current.is_day === 1,
            }
        }

        async function fetchAll() {
            try {
                const results = await Promise.all(LOCATIONS.map(fetchOne))
                setWeatherList(results)
                setError(false)
            } catch (err) {
                if ((err as Error).name !== 'AbortError') setError(true)
            }
        }

        fetchAll()
        const interval = setInterval(fetchAll, 15 * 60 * 1000) // refresh every 15 min

        return () => {
            controller.abort()
            clearInterval(interval)
        }
    }, [])

    if (error) {
        return <div className={styles.container}>Weather unavailable</div>
    }

    if (!weatherList) {
        return <div className={styles.container}>Loading…</div>
    }

    return (
        <div className={styles.container}>
            {weatherList.map((weather) => (
                <div key={weather.name} className={styles.locationBlock}>
                    <span className={styles.temperature}>{weather.temperature}°C</span>
                    <span className={styles.location}>{weather.name}</span>
                    <span className={styles.condition}>
                        {WEATHER_CODES[weather.weatherCode] ?? 'Unknown'}
                    </span>
                </div>
            ))}
        </div>
    )
}