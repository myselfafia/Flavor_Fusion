import { useEffect, useRef, useState } from 'react'

function CountUp({ end, suffix = '', duration = 1500 }) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') { setValue(end); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const started = performance.now()
      const tick = (now) => {
        const progress = Math.min(1, (now - started) / duration)
        setValue(Math.round(end * (1 - Math.pow(1 - progress, 3))))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [end, duration])
  return <b ref={ref}>{value}{suffix}</b>
}

export default CountUp
