const stats = [
  { label: "COMMITS", jp: "コミット", value: "23", pct: 23 },
  { label: "FILES", jp: "ファイル", value: "82", pct: 82 },
  { label: "LINES", jp: "ライン", value: "5.5K", pct: 55 },
  { label: "STATUS", jp: "オープンソース", value: "OPEN SOURCE", pct: 100 },
];

export default function Stats() {
  return (
    <section className="py-20 relative">
      <div className="max-w-container mx-auto px-6">
        <div className="corner-brackets p-4">
          <div className="bg-section-bg border border-card-border rounded-lg p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((s) => (
                <div key={s.label}>
                  {/* Japanese label */}
                  <p className="text-[10px] text-accent-dark mb-1 tracking-wider">
                    {s.jp}
                  </p>

                  {/* Label */}
                  <p className="text-ui text-muted text-[10px] mb-3">
                    {s.label}
                  </p>

                  {/* Value */}
                  <p className="font-display text-3xl md:text-4xl font-bold text-accent tracking-wide mb-3">
                    {s.value}
                  </p>

                  {/* Mini progress bar */}
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
