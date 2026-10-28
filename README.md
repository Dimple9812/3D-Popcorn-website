# CINÉPOP — 3D popcorn brand site

A cinematic, scroll-driven brand experience built with React, TypeScript, Three.js / React Three Fiber, GSAP, Lenis and Tailwind CSS.

## What happens on the page

1. **Intro** — red and white strips grow across the screen, ripple in a coordinated wave, narrow, then swirl together and *become the walls of the cup* (each strip is one stave of the cup, morphed vertex-by-vertex in real time). The paper lip and label land, then ~180 kernels fall into the cup with gravity, bounce and settle. A few strays spill onto the table.
2. **Hero** — the 3D cup sits in front of the giant `SHOWTIME` headline (DOM text behind a transparent WebGL canvas), with real shadows, studio lighting and pointer parallax.
3. **Flavour section** — on scroll the cup spins and glides into the pine-green flavour section. Pick Salted, Caramel or Peri-Peri: the current cup tips over and flies out while the next cup (new stripe colours, new popcorn) sweeps in. Copy, flavour photo, accent colour and price swap in sync, and clicks are locked until the swap finishes. Size (S/M/L) scales the cup.

## Your popcorn images

The flavour photos are read from `public/popcorn/`:

| Flavour   | Path                          |
|-----------|-------------------------------|
| Salted    | `public/popcorn/regular.png`  |
| Caramel   | `public/popcorn/caramel.png`  |
| Peri-Peri | `public/popcorn/peri-peri.png`|

If your files have different names or extensions, change the `image` field in `src/data/flavours.ts`. Until a file is found, a tinted placeholder disc is shown.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Append `?capture` to the URL to freeze the 3D clock (used for frame-by-frame visual QA; drive it with `window.__t` and `window.__advance()`).

## Structure

```
src/
  data/flavours.ts      flavour copy, colours, image paths, sizes
  store.ts              selected flavour/size, switch lock, intro stage
  anim.ts               shared animation state, intro timeline, layout per section
  three/Scene.tsx       canvas, lights, environment
  three/Rig.tsx         scroll choreography + flavour switch carousel
  three/Cup.tsx         strip → cup morph, lip, label, base
  three/Popcorn.tsx     instanced kernels with fall/bounce simulation
  three/kernels.ts      procedural kernel meshes and pile layout
  components/           Nav, Hero, FlavourSection, Footer, Toast
```
