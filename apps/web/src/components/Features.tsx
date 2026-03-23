const features = [
  {
    icon: "⬡",
    title: "MULTI-PLATFORM",
    desc: "Simultaneous streaming to Kick, YouTube, and Twitch from a single autonomous agent. One agent, all platforms.",
  },
  {
    icon: "◎",
    title: "CONSCIOUSNESS VIZ",
    desc: "Real-time browser-based visualization of the AI agent's internal state, decision flows, and emotional processing.",
  },
  {
    icon: "⊞",
    title: "MULTI-AGENT",
    desc: "Orchestrate multiple AI agents in a single stream. Debate, collaborate, or compete — all autonomously.",
  },
  {
    icon: "⊘",
    title: "AI MODERATION",
    desc: "Intelligent chat moderation with context awareness. Understands nuance, handles toxicity, preserves banter.",
  },
  {
    icon: "◈",
    title: "REAL-TIME ANALYTICS",
    desc: "Live dashboards tracking viewer engagement, agent performance, chat sentiment, and revenue metrics.",
  },
  {
    icon: "⬢",
    title: "PLUGIN SYSTEM",
    desc: "Extensible architecture with a plugin API. Build custom behaviors, integrations, and consciousness modules.",
  },
];

export default function Features() {
  return (
    <section id="features" className="section-padding relative">
      {/* Watermark */}
      <div className="watermark -top-10 left-0 -translate-x-[30%]">
        機能
      </div>

      <div className="relative z-10 max-w-container mx-auto px-6">
        {/* Section header */}
        <div className="mb-20">
          <h2 className="font-display text-4xl md:text-6xl tracking-[0.1em] font-semibold mb-4">
            CAPABILITIES
          </h2>
          <div className="accent-line" />
        </div>

        {/* Grid with corner brackets */}
        <div className="corner-brackets p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-hover bg-card-bg border border-card-border rounded-lg p-8"
              >
                <div className="text-accent text-3xl mb-5">{f.icon}</div>
                <h3 className="text-ui text-white mb-3 text-[13px] font-medium tracking-[0.12em]">
                  {f.title}
                </h3>
                <p className="text-muted text-[13px] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
