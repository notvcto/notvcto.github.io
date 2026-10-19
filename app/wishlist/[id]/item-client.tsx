"use client";

import { StarRating } from "@/components/star-rating";
import { EASE_OUT_EXPO } from "@/lib/animation";
import { useLocalPrice } from "@/lib/currency";
import { categoryNames, mapLink, type L, type Lang, type WishlistItem } from "@/lib/items";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, MapPin, ShoppingBasket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const fadeIn = {
    initial: false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
};


export function ItemClient({ item }: { item: WishlistItem }) {
    const [lang, setLang] = useState<Lang>("en");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const images = Array.isArray(item.image) ? item.image : [item.image];

    useEffect(() => {
        // Restore language from localStorage or hash
        try {
            const hash = window.location.hash;
            const savedLang = localStorage.getItem("wishlist:lang");

            // Hash takes precedence and saves to localStorage
            if (hash === "#es") {
                setLang("es");
                try {
                    localStorage.setItem("wishlist:lang", "es");
                } catch {}
            } else if (savedLang === "en" || savedLang === "es") {
                setLang(savedLang);
            }
        } catch {
            // localStorage blocked
            if (window.location.hash === "#es") setLang("es");
        }
        setIsInitialized(true);
    }, []);

    // Update document title when language changes - use MutationObserver to prevent Next.js from reverting it
    useEffect(() => {
        if (!isInitialized) return;

        const title = lang === "en" ? item.title.en : item.title.es;
        const newTitle = `${title} | NOTVCTO`;
        document.title = newTitle;

        // Watch for title changes and force it back if Next.js tries to change it
        const observer = new MutationObserver(() => {
            if (document.title !== newTitle) {
                document.title = newTitle;
            }
        });

        observer.observe(document.querySelector('title') || document.head, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => observer.disconnect();
    }, [lang, isInitialized, item.title]);

    const t = (l: L) => l[lang];

    const switchLang = (next: Lang) => {
        setLang(next);
        if (!isInitialized) return;
        try {
            localStorage.setItem("wishlist:lang", next);
        } catch {
            // localStorage blocked
        }
    };

    const formatPrice = useLocalPrice();

    return (
        <main lang={lang} className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-28 md:pt-36 pb-24">
            {/* Back Button and Language Toggle */}
            <div className="flex items-center justify-between mb-8">
                <Link
                    href="/wishlist"
                    className="flex items-center gap-2 font-mono text-[10px] md:text-xs tracking-wider text-muted-foreground hover:text-accent transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {lang === "en" ? "Back to Wishlist" : "Volver a la Lista"}
                </Link>

                <div className="flex items-center gap-2 font-mono text-[10px] md:text-xs tracking-[0.3em]">
                    {(["en", "es"] as const).map(code => (
                        <button
                            key={code}
                            onClick={() => switchLang(code)}
                            aria-pressed={lang === code}
                            data-cursor-hover
                            className={`uppercase transition-colors duration-300 ${
                                lang === code ? "text-accent" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {code}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 items-center">
                {/* Left: Images */}
                <motion.div {...fadeIn} className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-lg overflow-hidden">
                        <Image
                            src={images[currentImageIndex]}
                            alt={t(item.title)}
                            fill
                            className="object-contain p-8"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            unoptimized
                        />
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-32 h-32 flex-shrink-0 rounded border-2 transition-all ${
                                        idx === currentImageIndex
                                            ? "border-accent"
                                            : "border-white/10 hover:border-white/30"
                                    }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${t(item.title)} ${idx + 1}`}
                                        fill
                                        className="object-contain p-3"
                                        sizes="128px"
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Right: Details */}
                <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="space-y-6">
                    {/* Category */}
                    <span className="inline-block font-mono text-[10px] tracking-wider px-3 py-1 border border-white/10 rounded-full text-muted-foreground/80">
                        {t(categoryNames[item.category])}
                    </span>

                    {/* Title */}
                    <h1 className="font-sans text-3xl md:text-4xl font-light tracking-tight leading-tight text-foreground">
                        {t(item.title)}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <StarRating rating={item.star_rating} className="w-4 h-4" />
                        <span className="font-mono text-xs text-muted-foreground">
                            ({item.star_rating.toFixed(1)} {lang === "en" ? "priority" : "prioridad"})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="border-t border-b border-white/10 py-6">
                        <p className="font-mono text-3xl tracking-wider text-accent mb-2">
                            {formatPrice(item.price_estimate)}
                        </p>
                        <p className="font-sans text-sm text-muted-foreground">
                            {lang === "en" ? "Estimated price" : "Precio estimado"}
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <h2 className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
                            {lang === "en" ? "About this item" : "Sobre este artículo"}
                        </h2>
                        <p className="font-sans text-base leading-relaxed text-foreground">{t(item.notes)}</p>
                    </div>

                    {/* Purchase Sources */}
                    <div>
                        <h2 className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4">
                            {lang === "en" ? "Where to buy" : "Dónde comprar"}
                        </h2>
                        <div className="space-y-3">
                            {item.sources.map(source => {
                                return (
                                    <div key={source.url}>
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-5 bg-white/5 border border-white/10 rounded-lg hover:border-accent/50 hover:bg-white/10 transition-all group"
                                            data-cursor-hover
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <ShoppingBasket className="w-7 h-7 text-muted-foreground shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-sans text-xl text-foreground group-hover:text-accent transition-colors">
                                                                {source.name}
                                                            </span>
                                                            {source.local && <MapPin className="w-4 h-4 text-accent" />}
                                                        </div>
                                                        {source.description && (
                                                            <p className="font-mono text-xs text-muted-foreground mt-1">
                                                                {t(source.description)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                                            </div>
                                        </a>
                                        {source.coords && (
                                            <a href={mapLink(source.coords)}
                                                target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 mt-3 font-mono text-xs tracking-wider text-muted-foreground hover:text-accent">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {lang === "en" ? "View on map" : "Ver en el mapa"}
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                        <p className="font-mono text-[10px] md:text-xs text-accent leading-relaxed">
                            {lang === "en"
                                ? "This is a wishlist item. Purchasing from any source works — just make sure it matches the description!"
                                : "Este es un artículo de lista de deseos. Comprar de cualquier fuente funciona — ¡solo asegúrate de que coincida con la descripción!"}
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
