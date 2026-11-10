export type AdPlacement = "intro" | "end" | "sidebar" | "index";

export const adsConfig = {
    frameOrigin: "https://ads.notvc.to",
    enabled: process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === "true",
    units: {
        wide: { key: "4354f360f5c39181fda663c280098eaf", width: 468, height: 60 },
        mobile: { key: "8c0862c573b41551f0463efc9b7d55f8", width: 320, height: 50 },
        sidebar: { key: "fd2ee69661b7afb7554a176de6756d7e", width: 300, height: 250 },
    },
};

export function selectAdUnit(placement: AdPlacement, availableWidth: number) {
    const units = placement === "sidebar" ? [adsConfig.units.sidebar] : [adsConfig.units.wide, adsConfig.units.mobile];
    return units.find(unit => availableWidth >= unit.width);
}
