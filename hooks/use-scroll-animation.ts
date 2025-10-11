import { useEffect, useRef, useState } from "react"
import { useScroll, useTransform, useSpring, type MotionValue } from "framer-motion"

export function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  return { ref, scrollYProgress }
}

export function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance])
}

export function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1])
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, 0])

  return { ref, opacity, y }
}

export function useScrollScale() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1])

  return { ref, scale, opacity }
}

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", updateMousePosition)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
    }
  }, [])

  return mousePosition
}

export function useSmoothScroll() {
  const { scrollY } = useScroll()
  const smoothScrollY = useSpring(scrollY, {
    damping: 15,
    stiffness: 100,
  })

  return smoothScrollY
}

