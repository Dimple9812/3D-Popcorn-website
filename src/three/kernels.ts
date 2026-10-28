import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import { CUP, mulberry32, radiusAt } from './cupShape'

/**
 * A popped kernel is a cluster of lumpy "wings" around a small core.
 * Built from displaced icospheres so it catches light like the real thing.
 */
export function makeKernelGeometry(seed: number, patchTint: [number, number, number]) {
  const rng = mulberry32(seed)
  const parts: THREE.BufferGeometry[] = []
  const count = 5 + Math.floor(rng() * 3)

  for (let p = 0; p < count; p++) {
    const r = p === 0 ? 0.062 : 0.045 + rng() * 0.03
    let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(r, 2)
    g.deleteAttribute('normal')
    g.deleteAttribute('uv')
    g = mergeVertices(g)

    const s1 = rng() * 10
    const s2 = rng() * 10
    const s3 = rng() * 10
    const squash = 0.72 + rng() * 0.4
    const pos = g.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize()
      const bump =
        1 +
        0.2 * Math.sin(v.x * 6 + s1) * Math.sin(v.y * 5 + s2) * Math.sin(v.z * 7 + s3) +
        0.07 * Math.sin(v.x * 17 + s2) * Math.sin(v.z * 15 + s1)
      v.multiplyScalar(r * bump)
      v.y *= squash
      pos.setXYZ(i, v.x, v.y, v.z)
    }

    // offset the wing around the core
    if (p > 0) {
      const dir = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize()
      g.translate(dir.x * 0.055, dir.y * 0.05, dir.z * 0.055)
    }
    g.computeVertexNormals()

    // vertex colour patches (salt/caramel pooling/chilli dust)
    const colors = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const n = Math.sin(v.x * 70 + s1) * Math.sin(v.y * 60 + s2) * Math.sin(v.z * 80 + s3)
      const isPatch = n > 0.35
      colors[i * 3] = isPatch ? patchTint[0] : 1
      colors[i * 3 + 1] = isPatch ? patchTint[1] : 1
      colors[i * 3 + 2] = isPatch ? patchTint[2] : 1
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    parts.push(g)
  }

  const merged = mergeGeometries(parts)!
  parts.forEach((g) => g.dispose())
  merged.computeBoundingSphere()
  return merged
}

export interface KernelTarget {
  pos: THREE.Vector3
  rot: THREE.Euler
  scale: number
  variant: number
  /** order in which it drops */
  order: number
  /** lands on the floor beside the cup */
  floor: boolean
}

/** Packed pile of kernels filling the cup and doming over the rim, plus a few strays. */
function buildTargets(): KernelTarget[] {
  const rng = mulberry32(1337)
  const pts: THREE.Vector3[] = []
  const H = CUP.height
  const dome = CUP.domeHeight
  const minD = 0.135
  const yMin = H * 0.8

  for (let attempt = 0; attempt < 24000 && pts.length < 175; attempt++) {
    const y = yMin + rng() * (H + dome - yMin)
    let maxR: number
    if (y <= H) maxR = radiusAt(y / H) - 0.16
    else {
      const k = (y - H) / dome
      maxR = (CUP.rTop + 0.02) * Math.sqrt(Math.max(0, 1 - k * k))
    }
    if (maxR <= 0.02) continue
    const a = rng() * Math.PI * 2
    const r = Math.sqrt(rng()) * maxR
    const p = new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r)
    let ok = true
    for (const q of pts) {
      if (q.distanceToSquared(p) < minD * minD) {
        ok = false
        break
      }
    }
    if (ok) pts.push(p)
  }

  pts.sort((a, b) => a.y - b.y)
  const targets: KernelTarget[] = pts.map((p, i) => ({
    pos: p,
    rot: new THREE.Euler(rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2),
    scale: 1.25 + rng() * 0.45,
    variant: i % 3,
    order: i,
    floor: false,
  }))

  // a few strays that bounced out onto the table
  const strays = [
    [-1.32, 0.45],
    [1.18, 0.9],
    [1.55, -0.2],
    [-0.95, 1.05],
    [-1.75, -0.35],
    [0.35, 1.3],
  ]
  strays.forEach(([x, z], i) => {
    targets.push({
      pos: new THREE.Vector3(x, 0.075, z),
      rot: new THREE.Euler(rng() * 6, rng() * 6, rng() * 6),
      scale: 1.3 + rng() * 0.3,
      variant: i % 3,
      order: Math.floor(pts.length * (0.35 + i * 0.1)),
      floor: true,
    })
  })
  return targets
}

export const KERNEL_TARGETS = buildTargets()
