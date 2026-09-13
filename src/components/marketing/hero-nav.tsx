import { GetStartedLink } from "@/components/onboarding/get-started-link";
import Image from "next/image";
import Link from "next/link";

export function HeroNav() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-[1470px] items-center justify-between px-6 pb-6 pt-8 lg:px-14 lg:pb-10 lg:pt-11">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="text-[17px] font-semibold tracking-[0.14em] text-white lg:text-[21px]">
          FATHOM
        </span>
        <Image
          src="/assets/hero/logo.svg"
          alt="Fathom"
          width={151}
          height={153}
          className="h-[18px] w-[18px] lg:h-5 lg:w-5"
          priority
        />
      </Link>

      <nav className="flex items-center gap-5 lg:gap-7">
        <Link
          href="/meetings"
          className="text-[14px] text-white/90 transition-colors hover:text-white lg:text-[15px]"
        >
          Log in
        </Link>
        <GetStartedLink className="rounded-full border border-[#56bbf9] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#56bbf9] transition-colors hover:bg-[#56bbf9] hover:text-black lg:px-5 lg:text-[12px]">
          Get started
        </GetStartedLink>
      </nav>
    </header>
  );
}
