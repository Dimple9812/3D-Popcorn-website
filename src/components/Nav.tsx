import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type Lenis from 'lenis'
import { useStore } from '../store'
import { FLAVOURS } from '../data/flavours'

export function scrollToId(id: string) {
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function Nav() {
  const ref = useRef<HTMLElement>(null)
  const stage = useStore((s) => s.introStage)
  const bag = useStore((s) => s.bag)
  const accent = useStore((s) => FLAVOURS[s.flavour].accent)
  const shown = stage === 'pop' || stage === 'done'

  useEffect(() => {
    if (!ref.current) return
    gsap.to(ref.current, {
      autoAlpha: shown ? 1 : 0,
      y: shown ? 0 : -16,
      duration: 0.9,
      ease: 'power3.out',
    })
  }, [shown])

  return (
    <header
      ref={ref}
      className="invisible fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 opacity-0 mix-blend-difference md:px-10 md:py-7"
    >
      <button onClick={() => scrollToId('hero')} className="flex items-baseline gap-2 text-cream">
        <span className="font-display text-2xl tracking-wide md:text-[28px]">CINÉPOP</span>
        <span className="hidden font-serif text-lg italic text-cream/70 sm:inline">popcorn co.</span>
      </button>

      <nav className="hidden items-center gap-9 text-[13px] font-semibold uppercase tracking-[0.18em] text-cream/80 md:flex">
        <button onClick={() => scrollToId('flavours')} className="transition hover:text-cream">
          Flavours
        </button>
        <button onClick={() => scrollToId('footer')} className="transition hover:text-cream">
          Our Story
        </button>
        <button onClick={() => scrollToId('footer')} className="transition hover:text-cream">
          Find us
        </button>
      </nav>

      <button
        onClick={() => scrollToId('flavours')}
        className="group flex items-center gap-3 rounded-full border border-cream/30 py-2 pl-4 pr-2 text-[12px] font-bold uppercase tracking-[0.16em] text-cream transition hover:border-cream"
      >
        Bag
        <span
          className="grid h-7 min-w-7 place-items-center rounded-full px-2 text-[12px] text-ink transition"
          style={{ background: bag ? accent : '#f6ecdc' }}
        >
          {bag}
        </span>
      </button>
    </header>
  )
}
