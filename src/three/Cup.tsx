import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FLAVOURS, type FlavourId } from '../data/flavours'
import { anim, now as timeNow, T, clamp01, easeInOutCubic, easeOutBack, easeOutExpo, layoutFor, lerp, range } from '../anim'
import { CUP, radiusAt } from './cupShape'
import { makeLabelTexture } from './labelTexture'
import { Popcorn } from './Popcorn'
import { useStore } from '../store'

interface Props {
  flavour: FlavourId
  /** true only for the very first cup, which is assembled from the intro strips */
  intro: boolean
  /** popcorn drop style for cups that enter on a flavour switch */
  enter?: boolean
}

const N = CUP.staves
const CENTER = (N - 1) / 2
const LABEL_V0 = 0.3
const LABEL_V1 = 0.7
const LABEL_ARC = 1.55

/** Shared stripe params so the flat curtain and the cup use the same mapping. */
function cupVertex(i: number, u: number, v: number, swirl: number, out: THREE.Vector3) {
  const theta = -Math.PI + ((i + u) / N) * Math.PI * 2 + swirl
  const r = radiusAt(v)
  out.set(Math.sin(theta) * r, v * CUP.height, Math.cos(theta) * r)
  return out
}

function makeStaveGeometry() {
  const g = new THREE.PlaneGeometry(1, 1, CUP.segU, CUP.segV)
  // uv is already 0..1 in both directions; positions are overwritten every morph frame
  return g
}

export function Cup({ flavour, intro, enter = false }: Props) {
  const f = FLAVOURS[flavour]
  const viewport = useThree((s) => s.viewport)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const setIntroStage = useStore((s) => s.setIntroStage)

  const staves = useMemo(() => Array.from({ length: N }, () => makeStaveGeometry()), [])
  useEffect(() => () => staves.forEach((g) => g.dispose()), [staves])

  const matA = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: f.cup.stripeA,
        roughness: 0.48,
        clearcoat: 0.35,
        clearcoatRoughness: 0.4,
        sheen: 0.4,
        sheenRoughness: 0.6,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(f.cup.stripeA),
        emissiveIntensity: intro ? 0.9 : 0,
      }),
    [f, intro],
  )
  const matB = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: f.cup.stripeB,
        roughness: 0.5,
        clearcoat: 0.35,
        clearcoatRoughness: 0.4,
        sheen: 0.4,
        sheenRoughness: 0.6,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(f.cup.stripeB),
        emissiveIntensity: intro ? 0.55 : 0,
      }),
    [f, intro],
  )
  useEffect(() => () => {
    matA.dispose()
    matB.dispose()
  }, [matA, matB])

  const labelTex = useMemo(() => makeLabelTexture(f), [f])
  useEffect(() => () => labelTex.dispose(), [labelTex])
  const labelGeo = useMemo(() => {
    const h = (LABEL_V1 - LABEL_V0) * CUP.height
    const g = new THREE.CylinderGeometry(
      radiusAt(LABEL_V1) + 0.006,
      radiusAt(LABEL_V0) + 0.006,
      h,
      48,
      1,
      true,
      -LABEL_ARC / 2,
      LABEL_ARC,
    )
    g.translate(0, ((LABEL_V0 + LABEL_V1) / 2) * CUP.height, 0)
    return g
  }, [])

  const rimRef = useRef<THREE.Mesh>(null)
  const bottomRef = useRef<THREE.Group>(null)
  const labelMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const done = useRef(false)
  const stageRef = useRef<string>('loading')

  // writes positions for a stave given its flat params and morph amount
  const v3 = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }), [])
  const writeStave = (
    i: number,
    m: number,
    flat: { x0: number; w: number; yBot: number; yTop: number } | null,
  ) => {
    const g = staves[i]
    const pos = g.attributes.position as THREE.BufferAttribute
    const uv = g.attributes.uv as THREE.BufferAttribute
    const swirl = (1 - m) * 1.6
    for (let k = 0; k < pos.count; k++) {
      const u = uv.getX(k)
      const v = uv.getY(k)
      cupVertex(i, u, v, swirl, v3.b)
      if (flat && m < 1) {
        v3.a.set(flat.x0 + u * flat.w, lerp(flat.yBot, flat.yTop, v), 0)
        // lift the strip slightly toward camera as it folds, for a sense of volume
        const arc = Math.sin(m * Math.PI) * 0.6
        v3.a.lerp(v3.b, m)
        v3.a.z += arc
        pos.setXYZ(k, v3.a.x, v3.a.y, v3.a.z)
      } else {
        pos.setXYZ(k, v3.b.x, v3.b.y, v3.b.z)
      }
    }
    pos.needsUpdate = true
    g.computeVertexNormals()
    g.computeBoundingSphere()
  }

  // non-intro cups are built immediately
  useEffect(() => {
    if (intro) return
    for (let i = 0; i < N; i++) writeStave(i, 1, null)
    done.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro])

  useFrame(({ clock }) => {
    if (!intro || done.current) return
    const now = timeNow(clock.elapsedTime)
    if (anim.introStart < 0) anim.introStart = now + 0.25
    if (anim.skipRequested) {
      anim.skipRequested = false
      anim.introStart = Math.min(anim.introStart, now - T.skipTo)
    }
    const t = now - anim.introStart

    // stage reporting for the DOM
    const stage = t < T.morphStart ? 'strips' : t < T.popStart ? 'cup' : t < T.done ? 'pop' : 'done'
    if (stage !== stageRef.current && t >= 0) {
      stageRef.current = stage
      setIntroStage(stage)
    }

    // curtain size in cup-local space
    const vp = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0))
    const lay = layoutFor(size.width / size.height).hero
    const sw = (vp.width * 1.04) / N
    const halfH = vp.height * 0.56

    const waveA = range(t, 0.65, 1.05) * (1 - range(t, 1.65, 2.05)) * 0.32
    const narrow = lerp(1, 0.58, easeInOutCubic(range(t, T.narrowStart, T.narrowStart + 0.6)))

    let mSum = 0
    for (let i = 0; i < N; i++) {
      const d = Math.abs(i - CENTER) / CENTER
      const growStart = T.growStart + d * 0.35
      const grow = easeOutExpo(range(t, growStart, growStart + 0.75))
      const wave = waveA * Math.sin(t * 5.4 - i * 0.62)
      const mStart = T.morphStart + (1 - d) * 0.3
      const m = easeInOutCubic(range(t, mStart, mStart + T.morphDur))
      mSum += m

      const top = i % 2 === 0
      let yTop: number, yBot: number
      if (top) {
        yTop = halfH
        yBot = halfH - 2 * halfH * grow
      } else {
        yBot = -halfH
        yTop = -halfH + 2 * halfH * grow
      }
      yTop += wave
      yBot += wave

      const xWorld = -vp.width * 0.52 + i * sw + (sw * (1 - narrow)) / 2
      const flat = {
        x0: (xWorld - lay.x) / lay.s,
        w: (sw * narrow) / lay.s,
        yBot: (yBot - lay.y) / lay.s,
        yTop: (yTop - lay.y) / lay.s,
      }
      writeStave(i, m, flat)
    }

    const mAvg = mSum / N
    matA.emissiveIntensity = (1 - mAvg) * 0.9
    matB.emissiveIntensity = (1 - mAvg) * 0.55

    const k = clamp01(range(t, T.cupDone - 0.35, T.cupDone + 0.25))
    const kb = easeOutBack(k)
    if (rimRef.current) rimRef.current.scale.setScalar(Math.max(0.0001, kb))
    if (bottomRef.current) bottomRef.current.visible = mAvg > 0.98
    if (labelMat.current) labelMat.current.opacity = easeInOutCubic(range(t, T.cupDone - 0.1, T.cupDone + 0.4))

    if (t > T.done + 0.5) {
      done.current = true
      matA.emissiveIntensity = 0
      matB.emissiveIntensity = 0
      setIntroStage('done')
    }
  })

  return (
    <group>
      {staves.map((g, i) => (
        <mesh key={i} geometry={g} material={i % 2 === 0 ? matA : matB} castShadow receiveShadow frustumCulled={false} />
      ))}

      {/* rolled paper lip */}
      <mesh
        ref={rimRef}
        position={[0, CUP.height, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={intro ? 0.0001 : 1}
        castShadow
      >
        <torusGeometry args={[CUP.rTop, 0.032, 16, 96]} />
        <meshPhysicalMaterial color={f.cup.rim} roughness={0.4} clearcoat={0.5} />
      </mesh>

      <group ref={bottomRef} visible={!intro}>
        {/* base */}
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[CUP.rBottom, 64]} />
          <meshStandardMaterial color={f.cup.base} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* inner liner so the inside reads darker than the outside */}
        <mesh position={[0, CUP.height * 0.66, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radiusAt(0.66) - 0.01, 48]} />
          <meshStandardMaterial color="#2a1a10" roughness={1} />
        </mesh>
      </group>

      {/* printed badge */}
      <mesh geometry={labelGeo} renderOrder={2}>
        <meshPhysicalMaterial
          ref={labelMat}
          map={labelTex}
          transparent
          opacity={intro ? 0 : 1}
          roughness={0.45}
          clearcoat={0.4}
          polygonOffset
          polygonOffsetFactor={-2}
          depthWrite={false}
        />
      </mesh>

      <Popcorn flavour={flavour} mode={intro ? 'intro' : enter ? 'quick' : 'static'} />
    </group>
  )
}
