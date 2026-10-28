import * as THREE from 'three'
import type { Flavour } from '../data/flavours'

/** Paper badge printed on the front of the cup. */
export function makeLabelTexture(f: Flavour) {
  const W = 1024
  const H = 560
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8

  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    const light = f.cup.stripeB
    const dark = f.id === 'peri' ? '#1b120c' : f.cup.stripeA
    const ink = f.id === 'peri' ? f.cup.stripeA : f.cup.base

    // badge
    const pad = 70
    const r = 70
    ctx.beginPath()
    ctx.roundRect(pad, pad, W - pad * 2, H - pad * 2, r)
    ctx.fillStyle = f.id === 'peri' ? '#F4E8DA' : light
    ctx.fill()
    ctx.lineWidth = 14
    ctx.strokeStyle = dark
    ctx.stroke()
    ctx.beginPath()
    ctx.roundRect(pad + 26, pad + 26, W - (pad + 26) * 2, H - (pad + 26) * 2, r - 22)
    ctx.lineWidth = 3
    ctx.strokeStyle = dark
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = ink
    ctx.font = '600 34px "Manrope Variable", Manrope, sans-serif'
    ctx.letterSpacing = '12px'
    ctx.fillText('SMALL BATCH · EST. 2026', W / 2, 168)
    ctx.letterSpacing = '6px'
    ctx.font = '170px Anton, Impact, sans-serif'
    ctx.fillText('CINÉPOP', W / 2, 300)
    ctx.font = 'italic 58px "Instrument Serif", Georgia, serif'
    ctx.letterSpacing = '0px'
    ctx.fillText(f.name, W / 2, 410)
    tex.needsUpdate = true
  }

  draw()
  if (document.fonts) {
    Promise.all([
      document.fonts.load('170px Anton'),
      document.fonts.load('italic 58px "Instrument Serif"'),
      document.fonts.load('600 34px "Manrope Variable"'),
    ])
      .then(draw)
      .catch(() => {})
  }
  return tex
}
