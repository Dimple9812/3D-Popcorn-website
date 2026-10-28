import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { anim, easeInOutCubic, layoutFor, lerp, now as timeNow } from '../anim'
import { useStore } from '../store'
import { FLAVOUR_ORDER, SIZES, type FlavourId } from '../data/flavours'
import { Cup } from './Cup'

interface Slot {
  id: number
  flavour: FlavourId
  intro: boolean
  enter: boolean
  leaving: boolean
  dir: 1 | -1
}

/**
 * One cup in the switching carousel. Entering cups sweep in from the side with
 * a spin and a tilt; leaving cups tip over and fly out the other way.
 */
function SwitchSlot({ slot, onGone }: { slot: Slot; onGone: (id: number) => void }) {
  const ref = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    const g = ref.current
    if (!g || !slot.enter) return
    const d = slot.dir
    const tl = gsap.timeline()
    g.position.set(3.6 * d, 0.9, -1.2)
    g.rotation.set(0.5, -2.6 * d, -0.55 * d)
    g.scale.setScalar(0.55)
    tl.to(g.position, { x: 0, y: 0, z: 0, duration: 1.05, ease: 'power3.out', delay: 0.3 }, 0)
      .to(g.rotation, { x: 0, y: 0, z: 0, duration: 1.15, ease: 'back.out(1.25)', delay: 0.3 }, 0)
      .to(g.scale, { x: 1, y: 1, z: 1, duration: 0.95, ease: 'power3.out', delay: 0.3 }, 0)
    return () => {
      tl.kill()
    }
  }, [slot.enter, slot.dir])

  useEffect(() => {
    const g = ref.current
    if (!g || !slot.leaving) return
    const d = slot.dir
    const tl = gsap.timeline({ onComplete: () => onGone(slot.id) })
    tl.to(g.rotation, { z: 0.85 * d, x: -0.25, y: `+=${2.2 * d}`, duration: 0.85, ease: 'power2.in' }, 0)
      .to(g.position, { x: -3.8 * d, y: -0.35, z: -1.4, duration: 0.85, ease: 'power3.in' }, 0.05)
      .to(g.scale, { x: 0.55, y: 0.55, z: 0.55, duration: 0.8, ease: 'power2.in' }, 0.05)
    return () => {
      tl.kill()
    }
  }, [slot.leaving, slot.dir, slot.id, onGone])

  return (
    <group ref={ref}>
      <Cup flavour={slot.flavour} intro={slot.intro} enter={slot.enter} />
    </group>
  )
}

export function Rig() {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const size = useThree((s) => s.size)
  const flavour = useStore((s) => s.flavour)
  const sizeId = useStore((s) => s.size)
  const introStage = useStore((s) => s.introStage)

  const nextId = useRef(1)
  const [slots, setSlots] = useState<Slot[]>([
    { id: 0, flavour: 'salted', intro: true, enter: false, leaving: false, dir: 1 },
  ])

  // flavour change → current cup leaves, new cup enters
  const lastFlavour = useRef<FlavourId>('salted')
  useEffect(() => {
    if (flavour === lastFlavour.current) return
    const from = FLAVOUR_ORDER.indexOf(lastFlavour.current)
    const to = FLAVOUR_ORDER.indexOf(flavour)
    const dir: 1 | -1 = to > from ? 1 : -1
    lastFlavour.current = flavour
    setSlots((prev) => [
      ...prev.map((s) => (s.leaving ? s : { ...s, leaving: true, dir })),
      { id: nextId.current++, flavour, intro: false, enter: true, leaving: false, dir },
    ])
  }, [flavour])

  const onGone = useRef((id: number) => setSlots((prev) => prev.filter((s) => s.id !== id))).current

  const state = useRef({ p: 0, exit: 0, sizeScale: 1, live: 0 })

  const lastT = useRef<number | null>(null)
  useFrame(({ clock, camera }) => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const st = state.current
    const t = timeNow(clock.elapsedTime)
    const dt = Math.min(1, lastT.current === null ? 0.016 : Math.max(0, t - lastT.current))
    lastT.current = t
    const k = 1 - Math.exp(-dt * 7)
    st.p += (anim.scroll - st.p) * k
    st.exit += (anim.exit - st.exit) * k
    const targetSize = SIZES.find((s) => s.id === sizeId)?.scale ?? 1
    st.sizeScale += (targetSize - st.sizeScale) * (1 - Math.exp(-dt * 6))
    const done = introStage === 'pop' || introStage === 'done'
    st.live += ((done ? 1 : 0) - st.live) * (1 - Math.exp(-dt * 1.8))

    const lay = layoutFor(size.width / size.height)
    const p = easeInOutCubic(Math.min(1, Math.max(0, st.p)))

    o.position.set(lerp(lay.hero.x, lay.flavour.x, p), lerp(lay.hero.y, lay.flavour.y, p) + st.exit * 5, 0)
    o.scale.setScalar(lerp(lay.hero.s, lay.flavour.s, p) * lerp(1, st.sizeScale, p))

    const arc = Math.sin(p * Math.PI)
    i.rotation.y = p * Math.PI * 2 + st.live * (Math.sin(t * 0.45) * 0.32 + anim.pointer.x * 0.35)
    i.rotation.x = st.live * (0.14 - anim.pointer.y * 0.07) + arc * 0.32
    i.rotation.z = arc * -0.14
    i.position.y = st.live * Math.sin(t * 1.15) * 0.035 + arc * 0.35

    // gentle camera parallax once the intro is over
    camera.position.x += (anim.pointer.x * 0.22 * st.live - camera.position.x) * k
    camera.position.y += (anim.pointer.y * 0.14 * st.live - camera.position.y) * k
    camera.lookAt(0, 0, 0)
  })

  const showShadow = introStage === 'pop' || introStage === 'done'

  return (
    <group ref={outer}>
      <group ref={inner}>
        {slots.map((s) => (
          <SwitchSlot key={s.id} slot={s} onGone={onGone} />
        ))}
      </group>
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={showShadow ? 0.55 : 0}
        scale={6}
        blur={2.6}
        far={3}
        resolution={512}
        color="#000000"
      />
    </group>
  )
}

