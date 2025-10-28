import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  end: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

const AnimatedCounter = ({
  end,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    const startValue = 0

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t)
      const easedProgress = easeOutQuad(progress)

      const currentCount = startValue + (end - startValue) * easedProgress
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration])

  const formattedValue = prefix + count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix

  return <span className={className}>{formattedValue}</span>
}

export default AnimatedCounter
