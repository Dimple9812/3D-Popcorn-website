/** Dimensions of the cup in local units. Origin = centre of the cup's base. */
export const CUP = {
  height: 1.72,
  rBottom: 0.6,
  rTop: 0.93,
  staves: 22,
  segU: 4,
  segV: 12,
  domeHeight: 0.55,
}

export const radiusAt = (v: number) => CUP.rBottom + (CUP.rTop - CUP.rBottom) * v

/** Small deterministic RNG so every cup's popcorn pile looks the same. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
