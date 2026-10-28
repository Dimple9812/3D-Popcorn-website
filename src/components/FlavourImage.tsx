import { useState } from 'react'
import type { Flavour } from '../data/flavours'

/** Shows the flavour photo from /public; falls back to a tinted disc if the file is missing. */
export function FlavourImage({ f, className = '' }: { f: Flavour; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        className={className}
        style={{
          background: `radial-gradient(circle at 35% 30%, ${f.kernel.colors[0]}, ${f.kernel.colors[1]} 45%, ${f.cup.stripeA} 100%)`,
        }}
        role="img"
        aria-label={f.name}
      />
    )
  }
  return (
    <img
      src={f.image}
      alt={`${f.name} popcorn`}
      className={`${className} object-cover`}
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
