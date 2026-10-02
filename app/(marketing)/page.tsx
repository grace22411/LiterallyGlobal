import { Hero } from "@/components/marketing/hero";
import { Impact } from "@/components/marketing/impact";
import { Audience } from "@/components/marketing/audience";
import { Services } from "@/components/marketing/services";
import { Guides } from "@/components/marketing/guides";
import { Resources } from "@/components/marketing/resources";
import { About } from "@/components/marketing/about";
import { Closing } from "@/components/marketing/closing";
import { FocusStrip } from "@/components/marketing/focus-strip";
import { SocialProof } from "@/components/marketing/social-proof";
import { Testimonials } from "@/components/marketing/testimonials";

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <SocialProof />
      <FocusStrip />
      <Impact />
      <Audience />
      <Testimonials />
      <Services />
      <Guides />
      <Resources />
      <About />
      <Closing />
    </main>
  );
}
