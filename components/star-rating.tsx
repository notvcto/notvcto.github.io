import { Star } from "lucide-react";

export function StarRating({ rating, className = "w-3.5 h-3.5" }: { rating: number; className?: string }) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
        <span role="img" aria-label={`${rating} / 3`} className="flex items-center gap-0.5">
            {Array.from({ length: 3 }, (_, index) => (
                <span key={index} aria-hidden="true" className={`relative inline-block ${className}`}>
                    <Star className={`${className} fill-none text-muted-foreground`} />
                    {(index < fullStars || (index === fullStars && hasHalf)) && (
                        <span className="absolute inset-0 overflow-hidden" style={{ width: index < fullStars ? "100%" : "50%" }}>
                            <Star className={`${className} fill-accent text-accent`} />
                        </span>
                    )}
                </span>
            ))}
        </span>
    );
}
