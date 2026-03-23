"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is MoltStream?",
    a: "MoltStream is an autonomous AI streaming platform built in TypeScript. It deploys intelligent agents that go live on Kick, YouTube, and Twitch — handling chat, content generation, and consciousness visualization without a human operator.",
  },
  {
    q: "Which platforms are supported?",
    a: "Currently MoltStream supports Kick, YouTube, and Twitch with simultaneous multi-platform streaming. Additional platform integrations are on the roadmap.",
  },
  {
    q: "Is MoltStream open source?",
    a: "Yes. The core engine is fully open source under the MIT license. Premium features like advanced analytics and dedicated infrastructure are available through paid tiers.",
  },
  {
    q: "What is Consciousness Visualization?",
    a: "It's a real-time browser-based rendering of the AI agent's internal state — decision trees, emotional processing, and attention flows — displayed as a visual overlay during streams.",
  },
  {
    q: "Can I run multiple agents simultaneously?",
    a: "Absolutely. The multi-agent system allows you to orchestrate multiple AI personalities in a single stream. They can debate, collaborate, or compete autonomously.",
  },
  {
    q: "How does AI moderation work?",
    a: "MoltStream's moderation engine uses context-aware natural language understanding to distinguish genuine toxicity from playful banter, maintaining healthy chat environments autonomously.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-padding relative">
      <div className="relative z-10 max-w-container mx-auto px-6">
        {/* Header */}
        <div className="mb-20">
          <h2 className="font-display text-4xl md:text-6xl tracking-[0.1em] font-semibold mb-4">
            FREQUENTLY ASKED
          </h2>
          <div className="accent-line" />
        </div>

        {/* Items */}
        <div className="max-w-3xl">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left group"
              >
                <span className="text-sm md:text-base font-body font-light text-white group-hover:text-accent transition-colors">
                  {faq.q}
                </span>
                <span className="text-accent text-lg ml-4 flex-shrink-0 font-light">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div className="pb-6 pr-8">
                  <p className="text-muted text-[13px] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
