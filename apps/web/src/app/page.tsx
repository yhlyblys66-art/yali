import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Marquee from "@/components/Marquee";
import Platforms from "@/components/Platforms";
import Stats from "@/components/Stats";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Marquee />
      <Platforms />
      <Stats />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
