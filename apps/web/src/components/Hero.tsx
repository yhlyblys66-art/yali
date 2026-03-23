export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Radial gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(30, 58, 138, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Japanese watermark */}
      <div className="watermark top-1/2 right-0 -translate-y-1/2 translate-x-[10%]">
        ストリーム
      </div>

      {/* Sparkle crosses */}
      <span className="sparkle top-[15%] left-[8%]" style={{ animationDelay: "0s" }}>✦</span>
      <span className="sparkle top-[25%] right-[15%]" style={{ animationDelay: "1s" }}>✦</span>
      <span className="sparkle bottom-[20%] left-[20%]" style={{ animationDelay: "2s" }}>✦</span>
      <span className="sparkle top-[60%] right-[30%]" style={{ animationDelay: "0.5s" }}>✦</span>

      <div className="relative z-10 max-w-container mx-auto px-6 pt-32 pb-20 w-full">
        {/* Coordinates text */}
        <p className="text-ui text-muted mb-8">
          v0.4.0 / TypeScript / Open Source
        </p>

        {/* Main heading */}
        <h1 className="font-display font-bold tracking-[0.08em] leading-[0.9] mb-8"
          style={{ fontSize: "clamp(48px, 8vw, 100px)" }}
        >
          MOLTSTREAM
        </h1>

        {/* Subheading list */}
        <div className="space-y-1 mb-10">
          {["STREAMING.", "AUTONOMOUS.", "INTELLIGENT."].map((word) => (
            <p
              key={word}
              className="font-display text-2xl md:text-4xl tracking-[0.15em] text-accent font-medium"
            >
              {word}
            </p>
          ))}
        </div>

        {/* Body paragraph */}
        <p className="max-w-xl text-muted text-sm leading-relaxed mb-12">
          An autonomous AI streaming platform built in TypeScript. MoltStream
          deploys intelligent agents that go live across Kick, YouTube, and
          Twitch — managing chat, generating content, and visualizing
          consciousness in real-time. No human operator required.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4">
          <a href="#" className="btn-filled">
            Launch Agent
          </a>
          <a href="#" className="btn-outline">
            View Source →
          </a>
        </div>

        {/* Thin red divider */}
        <div className="mt-20">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-40" />
        </div>
      </div>
    </section>
  );
}
