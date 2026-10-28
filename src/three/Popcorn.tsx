import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLAVOURS, type FlavourId } from '../data/flavours'
import { anim, now as timeNow, T } from '../anim'
import { KERNEL_TARGETS, makeKernelGeometry } from './kernels'
import { mulberry32 } from './cupShape'

const PATCH: Record<FlavourId, [number, number, number]> = {
  salted: [0.97, 0.88, 0.66],
  caramel: [0.78, 0.55, 0.32],
  peri: [0.95, 0.42, 0.28],
}

const GRAVITY = 15

/** Per-kernel fall parameters, deterministic. */
const FALL = (() => {
  const rng = mulberry32(99)
  return KERNEL_TARGETS.map((t) => {
    const height = 3.2 + rng() * 1.6
    const fallTime = Math.sqrt((2 * height) / GRAVITY)
    return {
      startOffset: new THREE.Vector3(
        t.floor ? t.pos.x * -0.6 : (rng() - 0.5) * 0.9,
        height,
        t.floor ? t.pos.z * -0.6 : (rng() - 0.5) * 0.9,
      ),
      fallTime,
      spin: new THREE.Vector3((rng() - 0.5) * 9, (rng() - 0.5) * 9, (rng() - 0.5) * 9),
      bounce: t.floor ? 0.32 : 0.1 + rng() * 0.08,
    }
  })
})()

type Mode = 'intro' | 'quick' | 'static'

interface Props {
  flavour: FlavourId
  mode: Mode
}

/** Popcorn pile: falls into the cup during the intro, settles with a quick hop on flavour switch. */
export function Popcorn({ flavour, mode }: Props) {
  const f = FLAVOURS[flavour]
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([])
  const mountTime = useRef<number | null>(null)
  const settled = useRef(false)

  const geometries = useMemo(
    () => [0, 1, 2].map((i) => makeKernelGeometry(11 + i * 7, PATCH[flavour])),
    [flavour],
  )
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries])

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: f.kernel.roughness,
        clearcoat: f.kernel.clearcoat,
        clearcoatRoughness: 0.25,
        sheen: flavour === 'salted' ? 0.6 : 0.2,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color('#fff4dc'),
      }),
    [f, flavour],
  )
  useEffect(() => () => material.dispose(), [material])

  // split targets by geometry variant
  const groups = useMemo(() => {
    const g: number[][] = [[], [], []]
    KERNEL_TARGETS.forEach((t, i) => g[t.variant].push(i))
    return g
  }, [])

  // instance colours
  useEffect(() => {
    const rng = mulberry32(flavour.length * 31)
    const c = new THREE.Color()
    groups.forEach((idx, gi) => {
      const mesh = meshes.current[gi]
      if (!mesh) return
      idx.forEach((_, k) => {
        c.set(f.kernel.colors[Math.floor(rng() * f.kernel.colors.length)])
        mesh.setColorAt(k, c)
      })
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    })
  }, [groups, f, flavour])

  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      p: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      s: new THREE.Vector3(),
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (settled.current) return
    const now = timeNow(clock.elapsedTime)
    if (mountTime.current === null) mountTime.current = now

    let base: number
    let stagger: number
    let heightScale = 1
    if (mode === 'intro') {
      if (anim.introStart < 0) return
      base = anim.introStart + T.popStart
      stagger = 0.0105
    } else if (mode === 'quick') {
      base = mountTime.current + 0.42
      stagger = 0.0028
      heightScale = 0.32
    } else {
      base = -Infinity
      stagger = 0
    }

    let allDone = true
    const { m, p, q, e, s } = tmp

    groups.forEach((idx, gi) => {
      const mesh = meshes.current[gi]
      if (!mesh) return
      idx.forEach((ti, k) => {
        const t = KERNEL_TARGETS[ti]
        const fall = FALL[ti]
        const fallTime = fall.fallTime * Math.sqrt(heightScale)
        const local = now - (base + t.order * stagger)

        if (local < 0) {
          allDone = false
          m.makeScale(0, 0, 0)
          mesh.setMatrixAt(k, m)
          return
        }

        if (local < fallTime) {
          allDone = false
          const k01 = local / fallTime
          const remaining = fallTime - local
          p.copy(t.pos)
          p.y += fall.startOffset.y * heightScale - 0.5 * GRAVITY * local * local
          // horizontal drift converges onto the target
          const drift = 1 - k01 * k01
          p.x += fall.startOffset.x * drift * heightScale
          p.z += fall.startOffset.z * drift * heightScale
          // keep above target
          if (p.y < t.pos.y) p.y = t.pos.y
          e.set(t.rot.x + fall.spin.x * remaining, t.rot.y + fall.spin.y * remaining, t.rot.z + fall.spin.z * remaining)
        } else {
          const after = local - fallTime
          if (after < 1.2) allDone = false
          p.copy(t.pos)
          const b = fall.bounce * heightScale
          p.y += b * Math.exp(-5.5 * after) * Math.abs(Math.sin(after * 10))
          if (t.floor) {
            const slide = 1 - Math.exp(-4 * after)
            p.x += fall.startOffset.x * -0.04 * slide
          }
          e.copy(t.rot)
        }

        q.setFromEuler(e)
        s.setScalar(t.scale)
        m.compose(p, q, s)
        mesh.setMatrixAt(k, m)
      })
      mesh.instanceMatrix.needsUpdate = true
    })

    if (allDone) settled.current = true
  })

  return (
    <group>
      {groups.map((idx, gi) => (
        <instancedMesh
          key={`${flavour}-${gi}`}
          ref={(el) => {
            meshes.current[gi] = el
          }}
          args={[geometries[gi], material, idx.length]}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      ))}
    </group>
  )
}
