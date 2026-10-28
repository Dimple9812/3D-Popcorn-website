import { scrollToId } from './Nav'

export function Footer() {
  return (
    <footer id="footer" className="relative z-[3] flex min-h-[80svh] flex-col justify-between gap-16 px-5 pb-8 pt-28 text-ink md:px-10">
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/50">Our story</p>
          <p className="mt-4 max-w-md font-serif text-3xl italic leading-[1.1] md:text-4xl">
            We started in a projection booth with a kettle, a bag of kernels and strong opinions about butter.
          </p>
        </div>
        <div className="text-sm leading-relaxed text-ink/70">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/50">Find us</p>
          <p className="mt-4">
            Kiosks in select cinemas,
            <br />
            and on your sofa via delivery.
          </p>
        </div>
        <div className="text-sm leading-relaxed text-ink/70">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/50">Say hi</p>
          <p className="mt-4">
            hello@cinepop.example
            <br />
            @cinepop.popcorn
          </p>
        </div>
      </div>

      <div>
        <button
          onClick={() => scrollToId('hero')}
          className="block w-full text-left font-display text-[24vw] leading-[0.8] tracking-[-0.01em] text-ink transition hover:text-cinema"
          aria-label="Back to top"
        >
          CINÉPOP
        </button>
        <div className="mt-6 flex flex-wrap justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-ink/50">
          <span>© {new Date().getFullYear()} Cinépop Popcorn Co.</span>
          <span>Popped fresh · Rated P for Popcorn</span>
        </div>
      </div>
    </footer>
  )
}
