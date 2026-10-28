import { useStore } from '../store'
import { FLAVOURS } from '../data/flavours'

export function Toast() {
  const toast = useStore((s) => s.toast)
  const accent = useStore((s) => FLAVOURS[s.flavour].accent)
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 top-24 z-50 -translate-x-1/2 transition-all duration-500 ${
        toast ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-full bg-cream py-2.5 pl-3 pr-5 text-[13px] font-semibold text-ink shadow-2xl shadow-black/30">
        <span className="grid h-6 w-6 place-items-center rounded-full text-[12px] text-white" style={{ background: accent }}>
          ✓
        </span>
        {toast}
      </div>
    </div>
  )
}
