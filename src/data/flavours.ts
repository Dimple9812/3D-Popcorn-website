/**
 * Single source of truth for every flavour.
 *
 * `image` points at the popcorn photos in /public. If your files use
 * different names, change ONLY these three paths.
 */
export type FlavourId = 'salted' | 'caramel' | 'peri'

export interface Flavour {
  id: FlavourId
  index: string
  name: string
  short: string
  lines: [string, string]
  notes: string
  image: string
  /** UI accent colour (buttons, highlights) */
  accent: string
  /** Text colour that reads on the accent */
  onAccent: string
  cup: {
    stripeA: string
    stripeB: string
    rim: string
    base: string
  }
  kernel: {
    colors: string[]
    roughness: number
    clearcoat: number
    /** chance for a kernel to get a spice dusting tint */
    dust?: string
  }
}

export const FLAVOURS: Record<FlavourId, Flavour> = {
  salted: {
    id: 'salted',
    index: '01',
    name: 'Classic Salted',
    short: 'Salted',
    lines: [
      'Butter-light kernels, kissed with flaky sea salt.',
      'The original that started the whole show.',
    ],
    notes: 'Sea salt · Cultured butter',
    image: '/popcorn/regular.png',
    accent: '#E63946',
    onAccent: '#FFF6EA',
    cup: { stripeA: '#D7262E', stripeB: '#FBF4E6', rim: '#FFFDF8', base: '#8E1519' },
    kernel: {
      colors: ['#F8EDCF', '#F3E3BA', '#FBF3DC', '#EED9A6'],
      roughness: 0.78,
      clearcoat: 0.05,
    },
  },
  caramel: {
    id: 'caramel',
    index: '02',
    name: 'Golden Caramel',
    short: 'Caramel',
    lines: [
      'Slow-cooked caramel with a glassy, shattering crunch.',
      'Sweet enough to steal every scene.',
    ],
    notes: 'Brown butter · Burnt sugar',
    image: '/popcorn/caramel.png',
    accent: '#F0A73A',
    onAccent: '#2A1606',
    cup: { stripeA: '#9A5521', stripeB: '#F6E5C6', rim: '#F6E5C6', base: '#5B2E0E' },
    kernel: {
      colors: ['#C9772A', '#DE9440', '#B9661F', '#E7A653'],
      roughness: 0.26,
      clearcoat: 0.9,
    },
  },
  peri: {
    id: 'peri',
    index: '03',
    name: 'Peri-Peri Fire',
    short: 'Peri-Peri',
    lines: [
      'Bird’s-eye chilli, smoked paprika and a squeeze of lemon.',
      'Turns every plot twist up a notch.',
    ],
    notes: 'Bird’s-eye chilli · Smoked paprika',
    image: '/popcorn/peri-peri.png',
    accent: '#FF5B24',
    onAccent: '#1B0F0A',
    cup: { stripeA: '#E2531B', stripeB: '#22160F', rim: '#F4E8DA', base: '#7A2508' },
    kernel: {
      colors: ['#F1BC78', '#E99A55', '#F4CB8E', '#E4884A'],
      roughness: 0.62,
      clearcoat: 0.1,
      dust: '#C9401A',
    },
  },
}

export const FLAVOUR_ORDER: FlavourId[] = ['salted', 'caramel', 'peri']

export type SizeId = 'S' | 'M' | 'L'

export const SIZES: { id: SizeId; label: string; weight: string; price: number; scale: number }[] = [
  { id: 'S', label: 'Small', weight: '60 g', price: 149, scale: 0.86 },
  { id: 'M', label: 'Medium', weight: '120 g', price: 229, scale: 1 },
  { id: 'L', label: 'Large', weight: '200 g', price: 299, scale: 1.12 },
]
