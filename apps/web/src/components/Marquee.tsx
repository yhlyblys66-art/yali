export default function Marquee() {
  const text =
    "AGENT-NATIVE STREAMING • KICK • YOUTUBE • TWITCH • AI CONSCIOUSNESS • REAL-TIME • AUTONOMOUS STREAMS • ";
  const repeated = text.repeat(4);

  return (
    <div className="relative overflow-hidden bg-accent py-4 select-none">
      <div
        className="whitespace-nowrap flex"
        style={{ animation: "marquee 20s linear infinite" }}
      >
        <span className="text-white text-ui text-[12px] tracking-[0.2em] font-medium">
          {repeated}
        </span>
        <span className="text-white text-ui text-[12px] tracking-[0.2em] font-medium">
          {repeated}
        </span>
      </div>
    </div>
  );
}
