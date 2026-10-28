/**
 * Mutable animation state shared between the DOM (GSAP / ScrollTrigger)
 * and the render loop. Kept outside React so scroll never triggers re-renders.
 */
export const anim = {
  /** clock time (s) at which the intro started; -1 = not started */
  introStart: -1,
  /** set true by the skip button; the render loop fast-forwards */
  skipRequested: false,
  /** 0 = hero, 1 = flavour section in place */
  scroll: 0,
  /** 0..1 as the footer comes in, used to lift the cup away */
  exit: 0,
  /** normalised pointer -1..1 */
  pointer: { x: 0, y: 0 },
}

/** Deterministic clock for visual QA: open the site with ?capture and drive window.__t. */
export const CAPTURE = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('capture')
export function now(clockTime: number) {
  if (CAPTURE) return (window as unknown as { __t?: number }).__t ?? 0
  return clockTime
}

/** Intro timeline (seconds from intro start). */
export const T = {
  growStart: 0.15,
  waveEnd: 2.0,
  narrowStart: 1.1,
  morphStart: 1.85,
  morphDur: 1.15,
  cupDone: 3.35,
  headline: 3.0,
  popStart: 3.45,
  done: 5.4,
  skipTo: 9,
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutBack = (t: number) => {
  const c1 = 1.5
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/** Where the cup sits for each section, given the canvas aspect ratio. */
export function layoutFor(aspect: number) {
  const mobile = aspect < 0.8
  if (mobile) {
    return {
      mobile,
      hero: { x: 0, y: -1.45, s: 0.58 },
      flavour: { x: 0, y: 0.32, s: 0.54 },
    }
  }
  return {
    mobile,
    hero: { x: 0, y: -1.12, s: 1 },
    flavour: { x: -1.05 * Math.min(1.25, aspect / 1.6), y: -1.28, s: 0.93 },
  }
}
