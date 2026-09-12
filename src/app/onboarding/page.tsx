import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export default function OnboardingPage() {
  return (
    <div className={sora.className}>
      <OnboardingFlow />
    </div>
  );
}
