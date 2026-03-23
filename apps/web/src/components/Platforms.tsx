const platforms = [
  { name: "KICK", split: "95/5", label: "CREATOR SPLIT", pct: 95 },
  { name: "YOUTUBE", split: "70/30", label: "CREATOR SPLIT", pct: 70 },
  { name: "TWITCH", split: "55/45", label: "CREATOR SPLIT", pct: 55 },
];

export default function Platforms() {
  return (
    <section id="platforms" className="section-padding relative">
      {/* Watermark */}
      <div className="watermark top-0 right-0 translate-x-[20%]">
        配信
      </div>

      <div className="relative z-10 max-w-container mx-auto px-6">
        {/* Header */}
        <div className="mb-20">
          <h2 className="font-display text-4xl md:text-6xl tracking-[0.1em] font-semibold mb-4">
            PLATFORMS
          </h2>
          <div className="accent-line" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="card-hover bg-card-bg border border-card-border rounded-lg p-8 flex flex-col"
            >
              {/* Platform name */}
              <p className="text-ui text-muted text-[11px] mb-6">{p.name}</p>

              {/* Split number */}
              <p className="font-display text-6xl md:text-7xl font-bold text-white tracking-[0.05em] mb-2">
                {p.split}
              </p>

              {/* Label */}
              <p className="text-ui text-accent text-[10px] mb-8">{p.label}</p>

              {/* Progress bar */}
              <div className="progress-bar mt-auto">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
