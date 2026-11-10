import { adsConfig } from "@/lib/ads";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy",
    description: "How notvc.to handles browser preferences, external services, and advertising choices.",
    alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
    return (
        <main className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 pt-28 md:pt-36 pb-24">
            <header className="pb-10 border-b border-white/10">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">NOTVCTO / PRIVACY</span>
                <h1 className="mt-5 mb-5 font-playfair text-5xl md:text-7xl tracking-tight text-white">Your visit. Your choices.</h1>
                <p className="text-lg italic leading-relaxed text-muted-foreground">This page explains what your browser stores, which outside services receive requests, and how advertising choices work on this site.</p>
                <p className="mt-6 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Last updated November 10, 2026</p>
            </header>

            <div className="space-y-10 pt-10 text-base leading-7 text-muted-foreground [&_h2]:font-playfair [&_h2]:text-2xl [&_h2]:text-white [&_h2]:mb-4 [&_p+p]:mt-4 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-white/30 [&_a:hover]:text-white">
                <section>
                    <h2>Loading a page sends a network request.</h2>
                    <p>Victor Soto maintains notvc.to. The site is hosted on GitHub Pages. Delivering a page sends information such as your IP address, browser headers, and requested URL to the hosting infrastructure. GitHub handles information it receives under its <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noreferrer">privacy statement</a>.</p>
                    <p>The site has no visitor accounts or public submission forms. Cloudflare Web Analytics measures page views, visits, and page performance; its reports can include page paths, referring sites, countries, browsers, and device categories. Cloudflare says the service does not collect or use visitors&apos; personal data. Its browser beacon may be blocked by ad-blocking extensions. See <a href="https://developers.cloudflare.com/web-analytics/about/" rel="noreferrer">Cloudflare&apos;s Web Analytics information</a>.</p>
                    <p>Contact links open your email application. If you email me, your address and message pass through our email providers so I can receive and answer them.</p>
                </section>

                <section>
                    <h2>Preferences stay in your browser.</h2>
                    <p>The wishlist saves your language and display preferences in local storage and its scroll position in session storage. Currency conversion uses your browser language and timezone to select a currency locally, then caches exchange rates in local storage. The adblocker notice also remembers its dismissal in local storage. Advertising choices for Adsterra are stored in your browser for up to 180 days; if storage is unavailable, the choice lasts for the current visit.</p>
                    <p>You can remove these preferences through your browser&apos;s site-data controls. Blocking storage does not prevent you from reading the site. The optional phone number and Dominican ID fields used when printing a résumé stay in the page&apos;s memory; the site does not upload or persist those values.</p>
                </section>

                <section>
                    <h2>Some content comes from outside services.</h2>
                    <p>Project cards and wishlist items can load images from external hosts, including Socialify, image services, and retailers. Loading those images sends a request to the host shown in the image URL, which can receive network information such as your IP address and browser headers.</p>
                    <p>When wishlist currency conversion is needed, your browser requests exchange rates from <a href="https://www.exchangerate-api.com/" rel="noreferrer">ExchangeRate-API</a> through open.er-api.com. External links take you to websites with their own privacy policies.</p>
                </section>

                <section>
                    <h2>Advertising follows your choices.</h2>
                    {adsConfig.enabled ? (
                        <p>Blog pages offer optional Adsterra display advertising to help support my work. Ad scripts load only after you allow them. Moving outside the blog or withdrawing permission removes the advertising frames and stops further requests from those frames.</p>
                    ) : (
                        <p>Adsterra display advertising is being prepared. Advertising is currently disabled and no advertising scripts load in this state.</p>
                    )}
                    <p>If you allow ads, Adsterra and its advertising partners receive requests that can include your IP address, browser and device details, referring site, and ad interactions. They may use cookies or similar technologies to deliver, personalize, and measure advertising. Advertiser links open websites with their own privacy policies.</p>
                    <p>Read <a href="https://adsterra.com/privacy-policy-managed/" rel="noreferrer">Adsterra&apos;s privacy policy</a> for its description of advertising data processing and available rights.</p>
                </section>

                <section>
                    <h2>Refusing consent keeps the site accessible.</h2>
                    <p>When advertising is enabled, the blog asks you to allow or decline Adsterra advertising before loading its scripts. You can revisit that choice through <Link href="/blog#privacy-settings">Privacy and cookie settings</Link>. Declining ads or using an adblocker does not restrict the articles.</p>
                    <p>Withdrawing permission stops further requests and removes active ad frames. It cannot recall information already received by third parties or delete cookies they set; you can manage stored data through your browser and contact the relevant provider about its processing.</p>
                </section>

                <section>
                    <h2>You can ask about information you send.</h2>
                    <p>For privacy questions or requests concerning information you have sent me, email <a href="mailto:contact@notvc.to">contact@notvc.to</a>. This page will be updated when the site&apos;s data use changes.</p>
                </section>
            </div>

            <footer className="mt-12 pt-6 border-t border-white/10 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                <Link href="/blog" className="hover:text-white transition-colors">Back to the blog</Link>
            </footer>
        </main>
    );
}
