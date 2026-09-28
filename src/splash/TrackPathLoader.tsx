export function TrackPathLoader() {
  return (
    <div className="relative min-h-screen w-full bg-[#070204] flex items-center justify-center p-6 overflow-hidden">
      {/* Background ambient radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle 750px at 50% 50%, rgba(130, 20, 32, 0.4) 0%, rgba(50, 6, 12, 0.2) 55%, #070204 100%)',
        }}
      />

      {/* Main Luxury Animated Card */}
      <div
        className="relative w-full max-w-3xl min-h-[260px] aspect-[16/9] rounded-xl overflow-hidden shadow-[0_25px_65px_-15px_rgba(0,0,0,0.9),0_0_45px_rgba(180,30,50,0.22)] ring-1 ring-amber-500/30 flex items-center justify-center p-8 animate-[cardFadeIn_1.2s_cubic-bezier(0.16,1,0.3,1)_both]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #4e0f19 0%, #30060c 75%, #180205 100%)',
        }}
      >
        {/* Outer Gold Border */}
        <div className="absolute inset-4 sm:inset-5 border-2 border-[#d4af37]/85 rounded-sm pointer-events-none animate-[borderAppear_1.2s_ease-out_both]" />

        {/* Inner Gold Inset Border with Corner Accents */}
        <div className="absolute inset-6 sm:inset-8 border border-[#e5c158]/55 pointer-events-none animate-[borderAppear_1.5s_ease-out_both]">
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#f3d982]" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#f3d982]" />
          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#f3d982]" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#f3d982]" />
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl px-4 w-full">
          {/* Title with Masked Reveal */}
          <div className="overflow-hidden py-1 px-3">
            <h1
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-normal bg-gradient-to-b from-[#fff6d1] via-[#ffd56b] to-[#b88c29] bg-clip-text text-transparent drop-shadow-[0_4px_14px_rgba(0,0,0,0.8)] animate-[smoothTitleReveal_1.4s_cubic-bezier(0.16,1,0.3,1)_0.15s_both]"
            >
              Track Path
            </h1>
          </div>

          {/* Ornamental Divider with Diamond */}
          <div className="flex items-center justify-center w-56 sm:w-80 my-4 gap-3">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#ffd56b]/80 to-[#ffd56b] origin-right animate-[expandLine_1.2s_cubic-bezier(0.16,1,0.3,1)_0.45s_both]" />
            <div
              className="text-[#ffd56b] text-xs transform rotate-45 animate-[popDiamond_0.8s_cubic-bezier(0.34,1.56,0.64,1)_0.4s_both]"
              style={{ textShadow: '0 0 10px rgba(255, 213, 107, 0.9)' }}
            >
              ◆
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#ffd56b]/80 to-[#ffd56b] origin-left animate-[expandLine_1.2s_cubic-bezier(0.16,1,0.3,1)_0.45s_both]" />
          </div>

          {/* Subtitle */}
          <div className="overflow-hidden">
            <p
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
              className="text-xs sm:text-sm text-[#e8c66e] uppercase font-semibold drop-shadow animate-[subtitleDrift_1.3s_cubic-bezier(0.22,1,0.36,1)_0.7s_both]"
            >
              Job &amp; Internship Tracker
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-40 sm:w-48 h-[2px] bg-amber-500/15 rounded-full mt-7 overflow-hidden animate-[fadeIn_0.6s_ease-out_0.9s_both]">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-[#ffd56b] to-white/90 animate-[progressTravel_1.6s_cubic-bezier(0.65,0,0.35,1)_1s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
