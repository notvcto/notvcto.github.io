import { About } from "@/components/about";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { SectionBlend } from "@/components/section-blend";
import { TechMarquee } from "@/components/tech-marquee";
import { Works } from "@/components/works";

export default function Home() {
    return (
        <main>
            <Hero />
            <SectionBlend />
            <About />
            <Works />
            <TechMarquee />
            <Footer />
        </main>
    );
}
