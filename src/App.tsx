import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { Scene } from './three/Scene'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { FlavourSection } from './components/FlavourSection'
import { Footer } from './components/Footer'
import { Toast } from './components/Toast'
import { anim } from './anim'
import { useStore } from './store'

gsap.registerPlugin(ScrollTrigger)

const BG = { hero: '#0b0807', flavour: '#0f3b36', footer: '#f6ecdc' }

export default function App() {
  const introStage = useStore((s) => s.introStage)

  // smooth scroll + scroll-driven state shared with the 3D scene
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    lenis.stop()
    ;(window as unknown as { __lenis: Lenis }).__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const bg = document.getElementById('bg')!
    gsap.set(bg, { backgroundColor: BG.hero })

    const st1 = ScrollTrigger.create({
      trigger: '#flavours',
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      onUpdate: (self) => {
        anim.scroll = self.progress
        bg.style.backgroundColor = gsap.utils.interpolate(BG.hero, BG.flavour, self.progress)
      },
    })
    const st2 = ScrollTrigger.create({
      trigger: '#footer',
      start: 'top bottom',
      end: 'top 30%',
      scrub: true,
      onUpdate: (self) => {
        anim.exit = self.progress
        bg.style.backgroundColor = gsap.utils.interpolate(BG.flavour, BG.footer, self.progress)
      },
    })

    const onMove = (e: PointerEvent) => {
      anim.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      anim.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) anim.skipRequested = true

    return () => {
      st1.kill()
      st2.kill()
      gsap.ticker.remove(tick)
      lenis.destroy()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  // unlock scrolling once the cup has formed
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
    if (!lenis) return
    if (introStage === 'pop' || introStage === 'done') {
      lenis.start()
      ScrollTrigger.refresh()
    }
  }, [introStage])

  return (
    <>
      <div id="bg" className="fixed inset-0 z-0" />
      <Scene />
      <Nav />
      <main className="relative">
        <Hero />
        <FlavourSection />
        <Footer />
      </main>
      <Toast />
      <div className="grain" aria-hidden />
    </>
  )
}
