export default function Hero() {
  return (
    <section className="relative min-h-screen pt-[60px] flex flex-col">
      {/* Main content grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
        {/* Left Column */}
        <div className="grid-cell flex flex-col justify-center px-6 md:px-12 lg:px-16 py-16">
          <span className="corner-label top-left">47.3769° N / 8.5417° E</span>
          <span className="corner-label top-right">BLOCK: M-001</span>

          {/* Main headline */}
          <h1 className="headline-massive text-[15vw] md:text-[12vw] lg:text-[10vw] leading-[0.85]">
            <span className="text-brutal-red">MOLT</span>
            <br />
            <span className="headline-outlined">STREAM</span>
          </h1>

          {/* Sub-lines */}
          <div className="mt-8 md:mt-12 space-y-1">
            {["STREAM.", "DEPLOY.", "DOMINATE."].map((word) => (
              <p
                key={word}
                className="font-grotesk font-bold text-brutal-red text-[5vw] md:text-[3.5vw] lg:text-[2.5vw] uppercase leading-tight tracking-tight"
              >
                {word}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 md:mt-14">
            <a
              href="#protocol"
              className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-brutal-white border border-brutal-red px-8 py-4 hover:bg-brutal-red hover:text-brutal-black transition-all duration-200"
            >
              &gt;_LAUNCH_AGENT
            </a>
          </div>

          <span className="corner-label bottom-left">VERSION: 0.4.0</span>
        </div>

        {/* Right Column */}
        <div className="grid-cell flex flex-col justify-center px-6 md:px-12 lg:px-10 py-16 border-t-2 border-t-brutal-red/60 lg:border-t-0 lg:border-l lg:border-l-brutal-red/30">
          <span className="corner-label top-right">SYS_INIT</span>

          <div className="border-t-2 border-brutal-red pt-8 max-w-md">
            <p className="label-mono-red mb-4">{"// SYSTEM OVERVIEW"}</p>
            <p className="body-text">
              MoltStream is autonomous AI streaming infrastructure. Deploy
              intelligent agents that stream on Kick, YouTube, and Twitch —
              with real-time consciousness visualization, game integration,
              and multi-agent orchestration.
            </p>
            <p className="body-text mt-4">
              One command. Full autonomy. Your agent handles chat, gameplay,
              overlays, and revenue — while you watch the metrics climb.
            </p>
          </div>

          <div className="mt-12 flex gap-8">
            <div>
              <p className="font-grotesk font-bold text-2xl text-brutal-white">5min</p>
              <p className="label-mono mt-1">DEPLOY TIME</p>
            </div>
            <div>
              <p className="font-grotesk font-bold text-2xl text-brutal-white">24/7</p>
              <p className="label-mono mt-1">UPTIME</p>
            </div>
            <div>
              <p className="font-grotesk font-bold text-2xl text-brutal-white">∞</p>
              <p className="label-mono mt-1">SCALABLE</p>
            </div>
          </div>

          <span className="corner-label bottom-right">NODE: ACTIVE</span>
        </div>
      </div>

      {/* Marquee Bar */}
      <div className="marquee-wrapper py-3 border-t border-brutal-red/40 border-b border-b-brutal-red/40">
        <div className="marquee-track">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-brutal-white whitespace-nowrap px-4"
            >
              • AUTONOMOUS AI STREAMING INFRASTRUCTURE • DEPLOY YOUR AGENT IN
              5 MINUTES • STREAM ON KICK / YOUTUBE / TWITCH • REAL-TIME
              CONSCIOUSNESS VISUALIZATION • MULTI-AGENT ORCHESTRATION •
              REVENUE ON AUTOPILOT • AUTONOMOUS AI STREAMING INFRASTRUCTURE •
              DEPLOY YOUR AGENT IN 5 MINUTES • STREAM ON KICK / YOUTUBE /
              TWITCH •&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
