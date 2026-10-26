const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-7234987851785688";
const slots = {
    intro: process.env.NEXT_PUBLIC_ADSENSE_INTRO_SLOT || "",
    end: process.env.NEXT_PUBLIC_ADSENSE_END_SLOT || "",
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || "",
    index: process.env.NEXT_PUBLIC_ADSENSE_INDEX_SLOT || "",
};

export type AdPlacement = keyof typeof slots;
export const adsConfig = {
    client,
    slots,
    enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true"
        && /^ca-pub-\d{16}$/.test(client)
        && Object.values(slots).every(slot => /^\d+$/.test(slot)),
};
