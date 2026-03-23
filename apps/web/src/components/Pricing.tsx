const tiers = [
  {
    name: "FREE",
    price: "$0",
    period: "/forever",
    features: [
      "Single agent instance",
      "One platform at a time",
      "Basic chat moderation",
      "Community support",
      "Open source core",
    ],
    cta: "GET STARTED",
    highlighted: false,
  },
  {
    name: "STARTER",
    price: "$149",
    period: "/month",
    features: [
      "Up to 3 agent instances",
      "Multi-platform streaming",
      "Advanced moderation",
      "Analytics dashboard",
      "Email support",
    ],
    cta: "START TRIAL",
    highlighted: false,
  },
  {
    name: "PRO",
    price: "$399",
    period: "/month",
    features: [
      "Unlimited agents",
      "All platforms",
      "Consciousness visualization",
      "Custom plugin support",
      "Priority support",
      "API access",
    ],
    cta: "GO PRO",
    highlighted: true,
  },
  {
    name: "BUSINESS",
    price: "$999",
    period: "/month",
    features: [
      "Everything in Pro",
      "Dedicated infrastructure",
      "Custom AI training",
      "White-label option",
      "SLA guarantee",
      "24/7 support",
    ],
    cta: "CONTACT US",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-padding relative">
      {/* Watermark */}
      <div className="watermark top-10 left-1/2 -translate-x-1/2">
        価格
      </div>

      <div className="relative z-10 max-w-container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-6xl tracking-[0.1em] font-semibold mb-4">
            SELECT YOUR TIER
          </h2>
          <div className="accent-line mx-auto" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`
                card-hover bg-card-bg border rounded-lg p-8 flex flex-col
                ${
                  t.highlighted
                    ? "border-accent shadow-[0_0_30px_rgba(220,38,38,0.15)] relative -translate-y-2"
                    : "border-card-border"
                }
              `}
            >
              {t.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] uppercase tracking-[0.15em] bg-accent text-white px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              {/* Tier name */}
              <p className="text-ui text-muted text-[11px] mb-6">{t.name}</p>

              {/* Price */}
              <div className="mb-8">
                <span className="font-display text-5xl font-bold text-white">
                  {t.price}
                </span>
                <span className="text-muted text-sm ml-1">{t.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-10 flex-1">
                {t.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2 text-[13px] text-muted"
                  >
                    <span className="text-accent text-[10px] mt-[5px]">✦</span>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={
                  t.highlighted
                    ? "btn-filled w-full text-center"
                    : "btn-outline w-full text-center"
                }
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
