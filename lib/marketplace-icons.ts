export const MARKETPLACE_ICONS: Record<string, string> = {
  // E-commerce
  amazon: "amazon",
  ebay: "ebay",

  // Tech/Maker
  "hak5": "hak5",
  "tindie": "tindie",
  "crowd supply": "crowdsupply",
  "m5stack": "m5stack",

  // Brands
  "flipper zero": "flipperzero",
  "great scott gadgets": "greatscott",
  "leatherman": "leatherman",
  "waveshare": "waveshare",

  // Generic fallback
  _fallback: "shopping-basket",
}

/**
 * Match a purchase source to an icon key. Checks name first (case-insensitive),
 * then URL domain. Returns the icon key or "_fallback".
 */
export function getMarketplaceIcon(source: { name: string; url: string }): string {
  const nameLower = source.name.toLowerCase()

  // Direct name match
  for (const [key, icon] of Object.entries(MARKETPLACE_ICONS)) {
    if (key === "_fallback") continue
    if (nameLower.includes(key)) return icon
  }

  // URL domain match
  const urlLower = source.url.toLowerCase()
  for (const [key, icon] of Object.entries(MARKETPLACE_ICONS)) {
    if (key === "_fallback") continue
    if (urlLower.includes(key.replace(/\s+/g, ""))) return icon
  }

  return MARKETPLACE_ICONS._fallback
}
