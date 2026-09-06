"use client";

import { EASE_OUT_EXPO } from "@/lib/animation";
import { useLocalPrice } from "@/lib/currency";
import {
    categoryNames,
    courierAddress,
    items,
    ui,
    type Category,
    type L,
    type Lang,
    type WishlistItem,
} from "@/lib/items";
import { motion } from "framer-motion";
import { ChevronDown, LayoutGrid, List, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
};

type SortOption = "default" | "price-low" | "price-high" | "priority-high" | "priority-low";
type ViewMode = "list" | "grid";

const categories: Category[] = ["Tools", "RF Gear", "Storage", "Electronics", "Hardware"];

function StarRating({ rating }: { rating: number }) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 3 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-accent text-accent" />
            ))}
            {hasHalf && (
                <div className="relative w-3.5 h-3.5">
                    <Star className="absolute inset-0 w-3.5 h-3.5 fill-none text-muted-foreground" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                        <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    </div>
                </div>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} className="w-3.5 h-3.5 fill-none text-muted-foreground" />
            ))}
        </div>
    );
}

function ProductImage({ item, sizes }: { item: WishlistItem; sizes: string }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = Array.isArray(item.image) ? item.image : [item.image];

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <>
            {images.map((img, idx) => (
                <Image
                    key={idx}
                    src={img}
                    alt={item.title.en}
                    fill
                    className={`object-contain p-1.5 group-hover:scale-105 transition-all duration-700 ${
                        idx === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                    sizes={sizes}
                    unoptimized
                />
            ))}
        </>
    );
}

export function WishlistClient() {
    const [lang, setLang] = useState<Lang>("en");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [showShipping, setShowShipping] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [isInitialized, setIsInitialized] = useState(false);

    // Restore language and view mode from localStorage on mount
    useEffect(() => {
        try {
            const hash = window.location.hash;
            const savedLang = localStorage.getItem("wishlist:lang");
            const savedView = localStorage.getItem("wishlist:view");

            let finalLang: Lang = "en";

            // Hash takes precedence and saves to localStorage
            if (hash === "#es") {
                finalLang = "es";
                setLang("es");
                try {
                    localStorage.setItem("wishlist:lang", "es");
                } catch {}
            } else if (savedLang === "en" || savedLang === "es") {
                finalLang = savedLang;
                setLang(savedLang);
            }

            if (savedView === "list" || savedView === "grid") {
                setViewMode(savedView);
            }

            // Restore scroll position
            const savedScroll = sessionStorage.getItem("wishlist:scroll");
            if (savedScroll) {
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    window.scrollTo(0, parseInt(savedScroll, 10));
                });
            }
        } catch {
            // localStorage blocked
            if (window.location.hash === "#es") {
                setLang("es");
            }
        }
        setIsInitialized(true);
    }, []);

    // Save scroll position before navigating away
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Check if clicking a link to an item
            const target = e.target as HTMLElement;
            const link = target.closest('a[href^="/wishlist/"]');
            if (link && link.getAttribute('href') !== '/wishlist') {
                try {
                    sessionStorage.setItem("wishlist:scroll", window.scrollY.toString());
                } catch {
                    // sessionStorage blocked
                }
            }
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    // Update document title based on language - use MutationObserver to prevent Next.js from reverting it
    useEffect(() => {
        if (!isInitialized) return;

        const newTitle = lang === "en" ? "Wishlist | NOTVCTO" : "Lista de Deseos | NOTVCTO";
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
    }, [lang, isInitialized]);

    // Persist language changes
    useEffect(() => {
        if (!isInitialized) return;
        try {
            localStorage.setItem("wishlist:lang", lang);
        } catch {
            // localStorage blocked
        }
    }, [lang, isInitialized]);

    // Persist view mode changes
    useEffect(() => {
        if (!isInitialized) return;
        try {
            localStorage.setItem("wishlist:view", viewMode);
        } catch {
            // localStorage blocked
        }
    }, [viewMode, isInitialized]);

    const t = (l: L) => l[lang];

    const switchLang = (next: Lang) => {
        setLang(next);
    };

    const toggleCategory = (category: Category) => {
        const newSet = new Set(selectedCategories);
        if (newSet.has(category)) {
            newSet.delete(category);
        } else {
            newSet.add(category);
        }
        setSelectedCategories(newSet);
    };

    const formatPrice = useLocalPrice();

    const filteredAndSortedItems = useMemo(() => {
        let result = items;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                item =>
                    t(item.title).toLowerCase().includes(query) ||
                    t(item.notes).toLowerCase().includes(query) ||
                    item.category.toLowerCase().includes(query),
            );
        }

        // Filter by categories
        if (selectedCategories.size > 0) {
            result = result.filter(item => selectedCategories.has(item.category));
        }

        // Sort
        const sorted = [...result];
        switch (sortOption) {
            case "price-low":
                sorted.sort((a, b) => {
                    const priceA = typeof a.price_estimate === "number" ? a.price_estimate : a.price_estimate.min;
                    const priceB = typeof b.price_estimate === "number" ? b.price_estimate : b.price_estimate.min;
                    return priceA - priceB;
                });
                break;
            case "price-high":
                sorted.sort((a, b) => {
                    const priceA = typeof a.price_estimate === "number" ? a.price_estimate : a.price_estimate.max;
                    const priceB = typeof b.price_estimate === "number" ? b.price_estimate : b.price_estimate.max;
                    return priceB - priceA;
                });
                break;
            case "priority-high":
                sorted.sort((a, b) => b.star_rating - a.star_rating);
                break;
            case "priority-low":
                sorted.sort((a, b) => a.star_rating - b.star_rating);
                break;
            default:
                // Keep original order
                break;
        }

        return sorted;
    }, [searchQuery, selectedCategories, sortOption, lang]);

    if (!isInitialized) {
        return null;
    }

    return (
        <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 pt-28 md:pt-36 pb-24">
            <article lang={lang}>
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
                    className="mb-12 border-b border-white/10 pb-8"
                >
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground uppercase mb-2">
                                {t(ui.birthdayNote)}
                            </p>
                            <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground uppercase">
                                07 — {t(ui.wishlist)}
                            </p>
                        </div>

                        {/* Language Toggle */}
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

                    <h1 className="font-sans text-4xl md:text-6xl font-light tracking-tight leading-[1.1] mb-6">
                        {t(ui.wishlist)}
                    </h1>

                    {/* Shipping Info Toggle */}
                    <button
                        onClick={() => setShowShipping(!showShipping)}
                        data-cursor-hover
                        className="flex items-center gap-2 font-mono text-[10px] md:text-xs tracking-wider text-accent hover:text-accent/80 transition-colors"
                    >
                        <ChevronDown className={`w-3 h-3 transition-transform ${showShipping ? "rotate-180" : ""}`} />
                        {t(ui.shippingInfo)}
                    </button>

                    {showShipping && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 border border-white/10 rounded-lg bg-white/5"
                        >
                            <p className="font-sans text-sm text-muted-foreground mb-2">{t(ui.shippingNote)}</p>
                            <p className="font-sans text-sm text-accent mb-3 font-medium">{t(ui.shippingWarning)}</p>
                            <div className="font-mono text-[10px] md:text-xs tracking-wider text-foreground space-y-1">
                                <p>{courierAddress.name}</p>
                                <p>{courierAddress.line1}</p>
                                <p>{courierAddress.line2}</p>
                                <p>
                                    {courierAddress.city}, {courierAddress.state} {courierAddress.zip}
                                </p>
                                <p>{courierAddress.country}</p>
                                <p>{courierAddress.phone}</p>
                            </div>
                        </motion.div>
                    )}
                </motion.header>

                {/* Controls */}
                <motion.section {...fadeIn} className="mb-8 space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t(ui.search)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg font-mono text-sm tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>

                    {/* Category Filters */}
                    <div>
                        <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
                            {t(ui.filterByCategory)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    data-cursor-hover
                                    className={`font-mono text-[10px] md:text-xs tracking-wider px-3 py-1.5 border rounded-full transition-all duration-300 ${
                                        selectedCategories.has(category)
                                            ? "bg-accent text-background border-accent"
                                            : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                                    }`}
                                >
                                    {t(categoryNames[category])}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort and View Controls */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground uppercase">
                                {t(ui.sortBy)}:
                            </p>
                            <select
                                value={sortOption}
                                onChange={e => setSortOption(e.target.value as SortOption)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 font-mono text-[10px] md:text-xs tracking-wider text-foreground focus:outline-none focus:border-accent/50 transition-colors"
                            >
                                <option value="default">{t(ui.default)}</option>
                                <option value="price-low">
                                    {t(ui.price)} — {t(ui.lowToHigh)}
                                </option>
                                <option value="price-high">
                                    {t(ui.price)} — {t(ui.highToLow)}
                                </option>
                                <option value="priority-high">
                                    {t(ui.priority)} — {t(ui.highToLow)}
                                </option>
                                <option value="priority-low">
                                    {t(ui.priority)} — {t(ui.lowToHigh)}
                                </option>
                            </select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2">
                            <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground uppercase hidden sm:block">
                                {t(ui.viewMode)}:
                            </p>
                            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    data-cursor-hover
                                    className={`p-1.5 rounded transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-accent text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    aria-label={t(ui.gridView)}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    data-cursor-hover
                                    className={`p-1.5 rounded transition-colors ${
                                        viewMode === "list"
                                            ? "bg-accent text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    aria-label={t(ui.listView)}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Items Display */}
                {filteredAndSortedItems.length === 0 ? (
                    <motion.div {...fadeIn} className="text-center py-16">
                        <p className="font-mono text-sm text-muted-foreground">{t(ui.noResults)}</p>
                    </motion.div>
                ) : viewMode === "list" ? (
                    // List View (eBay-style horizontal cards)
                    <motion.section {...fadeIn} className="space-y-4">
                        {filteredAndSortedItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.01, ease: EASE_OUT_EXPO }}
                            >
                                <Link
                                    href={`/wishlist/${item.id}`}
                                    className="group relative bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300 block"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Product Image */}
                                        <div className="relative w-full sm:w-48 aspect-square sm:aspect-auto bg-gradient-to-br from-white/5 to-white/10 shrink-0">
                                            <ProductImage item={item} sizes="(max-width: 640px) 100vw, 192px" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-5 flex flex-col">
                                            {/* Title and Category */}
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <h3 className="font-sans text-lg md:text-xl font-light tracking-tight text-foreground flex-1">
                                                    {t(item.title)}
                                                </h3>
                                                <span className="font-mono text-[9px] md:text-[10px] tracking-wider px-2 py-0.5 border border-white/10 rounded-full text-muted-foreground/80 shrink-0">
                                                    {t(categoryNames[item.category])}
                                                </span>
                                            </div>

                                            {/* Star Rating */}
                                            <div className="mb-3">
                                                <StarRating rating={item.star_rating} />
                                            </div>

                                            {/* Price */}
                                            <p className="font-mono text-xl tracking-wider text-accent mb-3">
                                                {formatPrice(item.price_estimate)}
                                            </p>

                                            {/* Notes */}
                                            <p className="font-sans text-sm font-light leading-relaxed text-muted-foreground mb-4 flex-1">
                                                {t(item.notes)}
                                            </p>

                                            {/* View Button */}
                                            <div>
                                                <span
                                                    data-cursor-hover
                                                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-accent/10 border border-accent/20 rounded-lg font-mono text-[10px] tracking-widest uppercase text-accent group-hover:bg-accent/20 group-hover:border-accent/40 transition-all duration-300"
                                                >
                                                    {t(ui.viewItem)} →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.section>
                ) : (
                    // Grid View (current square cards)
                    <motion.section {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.01, ease: EASE_OUT_EXPO }}
                                className="flex"
                            >
                                <Link
                                    href={`/wishlist/${item.id}`}
                                    className="group relative bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300 flex flex-col w-full"
                                >
                                    {/* Product Image */}
                                    <div className="relative w-full aspect-square bg-gradient-to-br from-white/5 to-white/10 shrink-0">
                                        <ProductImage
                                            item={item}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        {/* Star Rating and Category */}
                                        <div className="flex items-center justify-between mb-3">
                                            <StarRating rating={item.star_rating} />
                                            <span className="font-mono text-[9px] md:text-[10px] tracking-wider px-2 py-0.5 border border-white/10 rounded-full text-muted-foreground/80">
                                                {t(categoryNames[item.category])}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-sans text-base md:text-lg font-light tracking-tight mb-2 text-foreground line-clamp-2 min-h-[3.5rem]">
                                            {t(item.title)}
                                        </h3>

                                        {/* Price */}
                                        <p className="font-mono text-lg tracking-wider text-accent mb-3">
                                            {formatPrice(item.price_estimate)}
                                        </p>

                                        {/* Notes */}
                                        <p className="font-sans text-sm font-light leading-relaxed text-muted-foreground mb-4 line-clamp-3 flex-1">
                                            {t(item.notes)}
                                        </p>

                                        {/* View Button */}
                                        <span
                                            data-cursor-hover
                                            className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg font-mono text-[10px] tracking-widest uppercase text-accent group-hover:bg-accent/20 group-hover:border-accent/40 transition-all duration-300"
                                        >
                                            {t(ui.viewItem)} →
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.section>
                )}
            </article>
        </main>
    );
}
