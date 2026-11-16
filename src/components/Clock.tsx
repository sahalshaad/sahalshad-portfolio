import { useEffect, useState } from 'react'

export function Clock() {
  const [timeString, setTimeString] = useState<string>('')

  useEffect(() => {
    function updateClock() {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        setTimeString(formatter.format(new Date()))
      } catch {
        setTimeString(new Date().toLocaleTimeString())
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
          Calicut · IST
        </span>
      </div>
      <p className="font-mono text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        {timeString || '--:--:--'}
      </p>
    </div>
  )
}
