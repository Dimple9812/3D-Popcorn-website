import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStore } from '../store'
import { FLAVOURS, FLAVOUR_ORDER, SIZES } from '../data/flavours'
import { FlavourImage } from './FlavourImage'

export function FlavourSection() {
  const flavour = useStore((s) => s.flavour)
  const size = useStore((s) => s.size)
  const switching = useStore((s) => s.switching)
  const setFlavour = useStore((s) => s.setFlavour)
  const setSize = useStore((s) => s.setSize)
  const addToBag = useStore((s) => s.addToBag)
  const showToast = useStore((s) => s.showToast)

  // `shown` lags `flavour` by the exit animation so copy swaps while hidden
  const [shown, setShown] = useState(flavour)
  const root = useRef<HTMLElement>(null)
  const prevShown = useRef(flavour)

  const f = FLAVOURS[shown]
  const live = FLAVOURS[flavour]
  const sizeData = SIZES.find((s) => s.id === size)!

  useEffect(() => {
    if (flavour === shown) return
    const el = root.current!
    const ctx = gsap.context(() => {
      gsap.to('[data-swap]', {
        yPercent: -70,
        autoAlpha: 0,
        duration: 0.36,
        ease: 'power2.in',
        stagger: 0.025,
      })
      gsap.to('[data-bgword]', { autoAlpha: 0, scale: 0.9, filter: 'blur(10px)', duration: 0.4, ease: 'power2.in' })
      gsap.to('[data-still]', {
        rotate: -18,
        x: -60,
        autoAlpha: 0,
        duration: 0.42,
        ease: 'power2.in',
        onComplete: () => setShown(flavour),
      })
    }, el)
    return () => ctx.kill()
  }, [flavour, shown])

  useLayoutEffect(() => {
    if (prevShown.current === shown) return
    prevShown.current = shown
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-swap]',
        { yPercent: 80, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.75, ease: 'power3.out', stagger: 0.05 },
      )
      gsap.fromTo(
        '[data-bgword]',
        { autoAlpha: 0, scale: 1.12, filter: 'blur(12px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' },
      )
      gsap.fromTo(
        '[data-still]',
        { rotate: 16, x: 80, autoAlpha: 0 },
        { rotate: -6, x: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.4)', delay: 0.15 },
      )
    }, root.current!)
    return () => ctx.kill()
  }, [shown])

  // entrance on scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-enter]', {
        y: 50,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: root.current, start: 'top 55%' },
      })
    }, root.current!)
    return () => ctx.revert()
  }, [])

  const order = () => {
    addToBag()
    showToast(`${sizeData.label} ${live.name} added to your bag · ₹${sizeData.price}`)
  }

  return (
    <section ref={root} id="flavours" className="relative h-[100svh] min-h-[700px] w-full md:min-h-[640px]">
      {/* ---------- behind the cup ---------- */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div
          className="absolute left-1/2 top-[30%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-1000 md:left-[33.5%] md:top-[52%]"
          style={{ background: `${live.accent}33` }}
        />
        <div
          data-bgword
          className="absolute left-1/2 top-[27%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[30vw] leading-none text-cream/[0.13] md:left-[33.5%] md:top-[50%] md:text-[19vw]"
        >
          <span className="text-outline">{f.short.toUpperCase()}</span>
        </div>

        {/* film still with the real photo */}
        <div
          data-still
          className="absolute bottom-[9%] left-[5vw] hidden w-[min(220px,15vw)] -rotate-6 rounded-[6px] bg-black p-2 shadow-2xl shadow-black/50 lg:block"
        >
          <div className="film-holes mb-2 h-[10px]" />
          <FlavourImage f={f} className="aspect-[4/5] w-full rounded-[3px]" />
          <div className="film-holes mt-2 h-[10px]" />
          <p className="mt-1 px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cream/60">
            Frame {f.index} — {f.short}
          </p>
        </div>
      </div>

      {/* ---------- in front of the cup ---------- */}
      <div className="pointer-events-none absolute inset-0 z-[3]">
        <div data-enter className="absolute left-5 top-24 hidden md:left-10 md:top-28 md:block">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cream/60">02 — The line-up</p>
          <p className="mt-2 hidden max-w-[16rem] font-serif text-2xl italic leading-tight text-cream md:block">
            Pick a flavour. Watch it pour.
          </p>
        </div>

        <div className="pointer-events-auto absolute inset-x-0 bottom-0 px-5 pb-6 md:inset-x-auto md:bottom-auto md:right-[5vw] md:top-1/2 md:w-[min(460px,38vw)] md:-translate-y-1/2 md:px-0 md:pb-0">
          <div data-enter className="flex items-center gap-4">
            <span data-swap className="font-display text-sm tracking-[0.2em] text-cream/60">
              {f.index} / 03
            </span>
            <span className="h-px flex-1 bg-cream/20" />
            <span data-swap className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/60 sm:inline">
              {f.notes}
            </span>
          </div>

          <div data-enter className="mt-4 overflow-hidden md:mt-6">
            <h2
              data-swap
              className="font-display text-[15vw] uppercase leading-[0.88] text-cream md:text-[clamp(56px,6.2vw,104px)]"
            >
              {f.name}
            </h2>
          </div>

          <div data-enter className="mt-3 overflow-hidden md:mt-5">
            <p data-swap className="max-w-md text-[14px] leading-relaxed text-cream/75 md:text-[15px]">
              {f.lines[0]}
              <br />
              {f.lines[1]}
            </p>
          </div>

          {/* flavour picker */}
          <div data-enter className="mt-5 md:mt-8">
            <p className="mb-3 hidden text-[10px] font-bold uppercase tracking-[0.28em] text-cream/50 md:block">
              Flavour
            </p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Flavour">
              {FLAVOUR_ORDER.map((id) => {
                const fl = FLAVOURS[id]
                const active = id === flavour
                return (
                  <button
                    key={id}
                    role="radio"
                    aria-checked={active}
                    disabled={switching && !active}
                    onClick={() => setFlavour(id)}
                    className={`group flex items-center gap-2.5 rounded-2xl border p-1.5 pr-3 text-left transition duration-500 ${
                      active ? 'border-transparent bg-cream text-ink' : 'border-cream/20 text-cream hover:border-cream/60'
                    } ${switching && !active ? 'cursor-wait' : ''}`}
                  >
                    <span
                      className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl md:h-12 md:w-12"
                      style={{ boxShadow: active ? `0 0 0 2px ${fl.accent}` : 'none' }}
                    >
                      <FlavourImage f={fl} className="h-full w-full transition duration-500 group-hover:scale-110" />
                    </span>
                    <span className="text-[12px] font-bold leading-tight md:text-[13px]">{fl.short}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* size picker */}
          <div data-enter className="mt-4 md:mt-6">
            <p className="mb-3 hidden text-[10px] font-bold uppercase tracking-[0.28em] text-cream/50 md:block">
              Size
            </p>
            <div className="grid grid-cols-3 rounded-full border border-cream/20 p-1" role="radiogroup" aria-label="Size">
              {SIZES.map((s) => {
                const active = s.id === size
                return (
                  <button
                    key={s.id}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSize(s.id)}
                    className={`rounded-full py-2 text-center transition duration-500 md:py-2.5 ${
                      active ? 'bg-cream text-ink' : 'text-cream/80 hover:text-cream'
                    }`}
                  >
                    <span className="block text-[13px] font-bold">{s.label}</span>
                    <span className={`block text-[10px] ${active ? 'text-ink/60' : 'text-cream/45'}`}>{s.weight}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* price + CTA */}
          <div data-enter className="mt-5 flex items-center gap-4 md:mt-8">
            <div className="leading-none">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-cream/50">Price</span>
              <p className="mt-1.5 font-display text-4xl tracking-wide text-cream">₹{sizeData.price}</p>
            </div>
            <button
              onClick={order}
              className="group relative flex h-14 flex-1 items-center justify-between overflow-hidden rounded-full pl-7 pr-2 text-[13px] font-extrabold uppercase tracking-[0.2em] transition-[background-color,color] duration-700 md:h-16"
              style={{ background: live.accent, color: live.onAccent }}
            >
              <span className="relative z-10">Order now</span>
              <span
                className="relative z-10 grid h-10 w-10 place-items-center rounded-full transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-rotate-45 md:h-12 md:w-12"
                style={{ background: live.onAccent, color: live.accent }}
              >
                →
              </span>
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-0" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
