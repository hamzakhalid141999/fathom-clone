import { HeroSection } from "@/components/marketing/hero-section";
import { Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export default function HomePage() {
  return (
    <div className={sora.className}>
      <HeroSection />
    </div>
  );
}
