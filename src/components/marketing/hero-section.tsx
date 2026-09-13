import { GetStartedLink } from "@/components/onboarding/get-started-link";
import { HeroNav } from "@/components/marketing/hero-nav";
import { Starfield } from "@/components/marketing/starfield";
import { Lock } from "lucide-react";
import Image from "next/image";

const COMPLIANCE = ["SOC 2 Type II", "GDPR", "HIPAA Compliant", "SSO / SCIM"];

export function HeroSection() {
  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden bg-black">
      <Starfield />
      <HeroNav />

      <div className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto grid w-full min-w-0 max-w-[1470px] grid-cols-1 items-center gap-14 px-6 py-14 lg:grid-cols-[minmax(0,820px)_minmax(0,1fr)] lg:gap-0 lg:px-14 lg:py-0">
          <div className="min-w-0">
            {/* The explicit break can't wrap, so the mobile size is capped to fit. */}
            <h1 className="text-[clamp(1.4rem,7.6vw,3rem)] font-light leading-[1.09] tracking-[-0.025em] text-white lg:text-[clamp(2.5rem,5.3vw,4.9rem)]">
              AI notetaking that is
              <br />
              out of this world
            </h1>

            <p className="mt-8 max-w-[88vw] text-[15px] leading-[1.45] text-white/75 lg:max-w-[520px] lg:text-[17px] lg:leading-[1.3]">
              Fathom summarizes your meetings so you can focus on the conversation.{" "}
              <span className="font-medium text-white">Now available bot-free.</span>
            </p>

            <GetStartedLink
              className="mt-8 inline-flex h-12 items-center rounded-full bg-[#56bbf9] px-7 text-[13px] font-medium uppercase tracking-[0.06em] text-[#04121c] transition-colors hover:bg-[#7ccbfb] lg:mt-9 lg:text-[15px]"
            >
              Get started - free forever
            </GetStartedLink>

            <div className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-white/55 lg:mt-8 lg:text-[13px]">
              <Lock className="h-3 w-3" aria-hidden />
              {COMPLIANCE.map((item, index) => (
                <span key={item} className="flex items-center gap-2">
                  {index > 0 ? <span className="text-white/25">|</span> : null}
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Single flat image: the floating product cards are baked into the avif. */}
          <div className="w-[88vw] max-w-[620px] justify-self-center lg:w-[42vw] lg:translate-y-3 lg:justify-self-end">
            {/* Inner element carries the animation so it doesn't fight the wrapper's offset. */}
            <div className="animate-levitate">
              <Image
                src="/assets/hero/hero-visual.avif"
                alt="Fathom meeting summary, Ask Fathom, and recording controls floating above a starfield"
                width={1400}
                height={900}
                sizes="(max-width: 1024px) 92vw, 42vw"
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
