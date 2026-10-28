import { create } from 'zustand'
import type { FlavourId, SizeId } from './data/flavours'

/** Time (s) the 3D cup needs to swap flavours. UI uses the same value so both stay in sync. */
export const SWITCH_DURATION = 1.35

type IntroStage = 'loading' | 'strips' | 'cup' | 'pop' | 'done'

interface State {
  flavour: FlavourId
  size: SizeId
  switching: boolean
  introStage: IntroStage
  toast: string | null
  bag: number
  addToBag: () => void
  setFlavour: (id: FlavourId) => void
  setSize: (id: SizeId) => void
  setIntroStage: (s: IntroStage) => void
  showToast: (msg: string) => void
}

let switchTimer: number | undefined
let toastTimer: number | undefined

export const useStore = create<State>((set, get) => ({
  flavour: 'salted',
  size: 'M',
  switching: false,
  introStage: 'loading',
  toast: null,
  bag: 0,
  addToBag: () => set((s) => ({ bag: s.bag + 1 })),
  setFlavour: (id) => {
    const { flavour, switching } = get()
    if (id === flavour || switching) return
    set({ flavour: id, switching: true })
    window.clearTimeout(switchTimer)
    switchTimer = window.setTimeout(() => set({ switching: false }), SWITCH_DURATION * 1000)
  },
  setSize: (id) => set({ size: id }),
  setIntroStage: (s) => {
    if (get().introStage !== s) set({ introStage: s })
  },
  showToast: (msg) => {
    set({ toast: msg })
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => set({ toast: null }), 3200)
  },
}))
