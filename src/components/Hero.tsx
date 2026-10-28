import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useStore } from '../store'
import { anim } from '../anim'
import { scrollToId } from './Nav'

const WORD = 'SHOWTIME'

export function Hero() {
  const stage = useStore((s) => s.introStage)
  const headline = useRef<HTMLDivElement>(null)
  const ui = useRef<HTMLDivElement>(null)
  const played = useRef(false)
  const tl = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    const letters = headline.current!.querySelectorAll<HTMLElement>('[data-letter]')
    const items = ui.current!.querySelectorAll<HTMLElement>('[data-reveal]')
    gsap.set(letters, { yPercent: 115 })
    gsap.set(items, { autoAlpha: 0, y: 24 })
    tl.current = gsap
      .timeline({ paused: true })
      .to(letters, {
        yPercent: 0,
        duration: 1.25,
        ease: 'expo.out',
        stagger: { each: 0.055, from: 'center' },
      })
      .to(items, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.55)
    return () => {
      tl.current?.kill()
    }
  }, [])

  useEffect(() => {
    if (played.current || !tl.current) return
    if (stage === 'cup') {
      played.current = true
      tl.current.delay(1.1).play()
    } else if (stage === 'pop' || stage === 'done') {
      played.current = true
      tl.current.play()
    }
  }, [stage])

  // headline drifts back slower than the page for depth
  useEffect(() => {
    const t = gsap.to(headline.current, {
      yPercent: 35,
      scale: 0.92,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    })
    return () => {
      t.scrollTrigger?.kill()
      t.kill()
    }
  }, [])

  const introRunning = stage === 'loading' || stage === 'strips' || stage === 'cup'

  return (
    <section id="hero" className="relative h-[100svh] min-h-[560px] w-full">
      {/* behind the cup */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 55% at 50% 58%, rgba(215,38,46,0.22) 0%, rgba(11,8,7,0) 70%)',
          }}
        />
        <div
          ref={headline}
          className="absolute inset-x-0 top-[41%] -translate-y-1/2 md:top-[51%] text-center font-display leading-[0.82] text-cream select-none"
        >
          <h1 className="sr-only">CINÉPOP — Showtime popcorn</h1>
          <div aria-hidden className="hidden whitespace-nowrap text-[22.5vw] tracking-[-0.01em] md:block">
            {WORD.split('').map((ch, i) => (
              <span key={i} className="mask">
                <span data-letter className="inline-block">
                  {ch}
                </span>
              </span>
            ))}
          </div>
          <div aria-hidden className="text-[39vw] tracking-[-0.01em] md:hidden">
            {['SHOW', 'TIME'].map((w) => (
              <div key={w}>
                {w.split('').map((ch, i) => (
                  <span key={i} className="mask">
                    <span data-letter className="inline-block">
                      {ch}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* in front of the cup */}
      <div ref={ui} className="pointer-events-none absolute inset-0 z-[3]">
        <div
          data-reveal
          className="absolute left-5 top-[13%] max-w-[15rem] md:left-10 md:top-[14%] md:max-w-[22rem]"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cream/55">Now playing</p>
          <p className="mt-2 font-serif text-[26px] italic leading-[1.05] text-cream md:text-[30px]">
            Small-batch popcorn, popped for the big screen.
          </p>
        </div>

        <div data-reveal className="absolute right-5 top-[14%] hidden text-right md:right-10 md:block">
          <div className="inline-flex flex-col items-end gap-1 rounded-[10px] border border-cream/25 px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cream/55">Admit one</span>
            <span className="font-display text-xl tracking-wide text-cream">ROW F · SEAT 12</span>
          </div>
        </div>

        <div
          data-reveal
          className="absolute bottom-7 left-5 hidden max-w-[19rem] md:block text-[13px] leading-relaxed text-cream/70 md:bottom-10 md:left-10"
        >
          Three flavours. Air-popped in tiny batches, seasoned by hand, and sealed while they still crackle.
        </div>

        <button
          data-reveal
          onClick={() => scrollToId('flavours')}
          className="pointer-events-auto absolute bottom-7 right-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.26em] text-cream md:bottom-10 md:right-10"
        >
          Pick your flavour
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-cream/40">
            <span className="animate-bounce">↓</span>
          </span>
        </button>
      </div>

      {/* intro skip */}
      <button
        onClick={() => {
          anim.skipRequested = true
        }}
        className={`fixed bottom-6 left-1/2 z-[35] -translate-x-1/2 rounded-full border border-white/30 bg-black/30 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.26em] text-white/80 backdrop-blur transition duration-500 hover:text-white ${
          introRunning ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        Skip intro
      </button>
    </section>
  )
}
