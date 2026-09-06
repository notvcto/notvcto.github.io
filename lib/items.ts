// Bilingual wishlist data. `L` is a localized string leaf — one tree, both
// languages side by side, so a missing translation is a type error.
export type L = { en: string; es: string };
export type Lang = "en" | "es";

export type Category = "Tools" | "RF Gear" | "Storage" | "Electronics" | "Hardware";

// Category translations
export const categoryNames: Record<Category, L> = {
    Tools: { en: "Tools", es: "Herramientas" },
    "RF Gear": { en: "RF Gear", es: "Equipo RF" },
    Storage: { en: "Storage", es: "Almacenamiento" },
    Electronics: { en: "Electronics", es: "Electrónica" },
    Hardware: { en: "Hardware", es: "Hardware" },
};

// Where to buy one item. `name` and `url` are all a source needs; the rest
// only matter for places you can physically walk into.
export interface PurchaseSource {
    name: string;
    url: string;
    description?: L;
    local?: boolean; // shows the map pin — a place you can walk into
    coords?: { lat: number; lon: number }; // optional, for local sources
}

export interface WishlistItem {
    id: string;
    title: L;
    sources: PurchaseSource[];
    price_estimate: number | { min: number; max: number }; // USD - single price or range
    category: Category;
    notes: L;
    star_rating: number; // 1.0 to 3.0, supports decimals like 2.5
    image: string | string[]; // Product image URL or array of URLs for cycling
}

export const ui = {
    wishlist: { en: "Wishlist", es: "Lista de Deseos" },
    search: { en: "Search items...", es: "Buscar..." },
    filterByCategory: { en: "Filter by Category", es: "Filtrar por Categoría" },
    sortBy: { en: "Sort by", es: "Ordenar por" },
    price: { en: "Price", es: "Precio" },
    priority: { en: "Priority", es: "Prioridad" },
    default: { en: "Default", es: "Por defecto" },
    lowToHigh: { en: "Low to High", es: "Menor a Mayor" },
    highToLow: { en: "High to Low", es: "Mayor a Menor" },
    allCategories: { en: "All Categories", es: "Todas las Categorías" },
    shippingInfo: { en: "Shipping Information", es: "Info de Envío" },
    shippingNote: {
        en: "For items not available locally in the DR, please ship to my US courier address:",
        es: "Pa' las cosas que no hay aquí en RD, por favor mándenlas a mi dirección de courier en USA:",
    },
    shippingWarning: {
        en: "Copy this EXACTLY. One wrong character and it won't arrive.",
        es: "Copia esto EXACTAMENTE. Un caracter mal y no llega.",
    },
    viewItem: { en: "View", es: "Ver" },
    noResults: { en: "No items found", es: "No encontré na'" },
    birthdayNote: {
        en: "Birthday: September 20",
        es: "Cumpleaños: 20 de septiembre",
    },
    viewMode: { en: "View", es: "Vista" },
    listView: { en: "List", es: "Lista" },
    gridView: { en: "Grid", es: "Cuadrícula" },
} satisfies Record<string, L>;

// OpenStreetMap instead of Google Maps — no tracking, no account, same pin.
export function mapLink({ lat, lon }: { lat: number; lon: number }) {
    return "https://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + lon + "#map=17/" + lat + "/" + lon;
}
export const courierAddress = {
    name: "Victor Enrique Soto Marcano",
    line1: "8298 NW 21st ST",
    line2: "Apt 011-002519",
    city: "Doral",
    state: "FL",
    zip: "33122-0002",
    country: "United States",
    phone: "+1 305-591-2900",
};

export const items: WishlistItem[] = [
    // Hardware, Tools & EDC
    {
        id: "ratcheting-screwdriver",
        title: {
            en: "High-Quality Ratcheting Screwdriver",
            es: "Destornillador de Trinquete Bueno",
        },
        sources: [
            {
                name: "LTT Store (US)",
                url: "https://lttstore.com/products/screwdriver",
                description: {
                    en: "Make sure to stay on the US shop",
                    es: "Asegurate de mantenerte en la tienda de Estados Unidos",
                },
            },
        ],
        price_estimate: 35,
        category: "Tools",
        notes: {
            en: "It just HAS to be good. I need something that won't strip or fail mid-project.",
            es: "Tiene que ser BUENO. Necesito algo que no se joda a medio proyecto.",
        },
        star_rating: 3,
        image: [
            "https://global.lttstore.com/cdn/shop/files/lttstore_LTTScrewdriver_TransparencyFile.png",
            "https://www.lttstore.com/cdn/shop/files/screwdriver_2.png",
        ],
    },
    {
        id: "precision-screwdriver-set",
        title: {
            en: "Quality Precision Screwdriver kit",
            es: "Kit destornillador de precision",
        },
        sources: [
            {
                name: "LTT Store",
                url: "https://www.lttstore.com/products/precision-multi-bit-screwdriver-kit-pro-61-bits",
            },
        ],
        price_estimate: 25,
        category: "Tools",
        notes: {
            en: "Same logic from the screwdriver carries on here. It has to be GOOD.",
            es: "Misma logica que el destornillador. Tiene que ser BUENO.",
        },
        star_rating: 2.5,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fglobal.lttstore.com%2Fcdn%2Fshop%2Ffiles%2FLTT-FloatplanePrecisionScrewdriverandBitCase-5.png%3Fv%3D1770069372%26width%3D3011&f=1&nofb=1&ipt=04306c18563dfc81951f1075802b3976ee29f5cbfcb4759b0e14e8cb55fa2d3b",
    },
    {
        id: "allen-key-set",
        title: {
            en: "Allen Key / Hex Key Set",
            es: "Set de Llaves Allen",
        },
        sources: [
            { name: "Amazon", url: "https://www.amazon.com/Hi-Spec-Imperial-Metric-Wrench-Folding/dp/B0CS3F9W6F" },
        ],
        price_estimate: { min: 15, max: 30 },
        category: "Tools",
        notes: {
            en: "Metric and imperial both. I work on everything.",
            es: "Métrico e imperial. Trabajo en to' tipo de vaina.",
        },
        star_rating: 2,
        image: "https://data.kleintools.com/sites/all/product_assets/png/klein/blk12.png",
    },
    {
        id: "10mm-socket",
        title: {
            en: "10mm Socket (Please, I Keep Losing Them)",
            es: "Dado de 10mm (Por fa', siempre los pierdo)",
        },
        sources: [
            { name: "Amazon", url: "https://www.amazon.com/CASOMAN-10Piece-Set-10mm-Shallow-Phosphate/dp/B0CZ3YHNV3" },
        ],
        price_estimate: 8,
        category: "Tools",
        notes: {
            en: "I always lose the DAMNED 10mm socket. Always. Just get me five of these.",
            es: "Siempre pierdo el maldito dado de 10mm. Siempre. Regálame como cinco de esos.",
        },
        star_rating: 1.5,
        image: "https://www.huttie.com/wp-content/uploads/2021/12/S0577.V3.png",
    },
    {
        id: "microcontroller-any",
        title: {
            en: "Microcontroller (Pi, ESP32, Arduino, Anything)",
            es: "Microcontrolador (Pi, ESP32, Arduino, Lo que sea)",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/Raspberry-Pi-4-4G-Model/dp/B081YD3VL5" }],
        price_estimate: { min: 10, max: 300 },
        category: "Electronics",
        notes: {
            en: "ANY OF THEM. Can be a Pi. Can be an ESP32. Can be an Arduino. I will use it.",
            es: "CUALQUIERA. Que sea un Pi, un ESP32, un Arduino. Lo voy a usar.",
        },
        star_rating: 3,
        image: [
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic0.howtogeekimages.com%2Fwordpress%2Fwp-content%2Fuploads%2F2025%2F02%2Fraspberry-pi-zero-2-w-png.png%3Fq%3D70%26fit%3Dcontain%26w%3D420%26dpr%3D1&f=1&nofb=1&ipt=0bf44a8740829044bbf12e7aa221563d2e5d529571205471e95331d72a5baae4",
            "https://cdn-reichelt.de/bilder/web/xxl_ws/A300/SBC-NODEMCU-ESP32-01.png",
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2F5.imimg.com%2Fdata5%2FSELLER%2FDefault%2F2025%2F4%2F502134023%2FSB%2FGZ%2FNQ%2F2425643%2Foriginal-arduino-uno-ek-r4-minima-made-in-india-500x500.png&f=1&nofb=1&ipt=710f0482bdbb91a80cb20bd55e1d1dde2bdd331658f1ed9d0dd24a0cdd3b5859",
        ],
    },
    {
        id: "usb-c-cables",
        title: {
            en: "High-Quality USB-C Cables",
            es: "Cables USB-C Buenos",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/Anker-2-Pack-Charging-MacBook-Galaxy/dp/B0CCRNJ7Y4" }],
        price_estimate: { min: 10, max: 35 },
        category: "Electronics",
        notes: {
            en: "I can never have enough USB-C cables. High-quality ones that won't fry my devices.",
            es: "Nunca tengo suficientes cables USB-C. Que sean buenos y no me quemen los aparatos.",
        },
        star_rating: 2,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.jelmo.cz%2Fout%2Fpictures%2Fmaster%2Fproduct%2F1%2Fxiaomi-6a-braided-usb-c-to-usb-c-cable-1m_11270-24748302-a322-43eb-8563-e3816e838b69.png&f=1&nofb=1&ipt=2d7c9107eb0de16d1cf03e612ab4fc109495e774a1a2deb08ebb9237716e37d7",
    },
    {
        id: "storage-any",
        title: {
            en: "Storage (Any Form — SSD, HDD, SD Card, Whatever)",
            es: "Almacenamiento (Lo que sea — SSD, HDD, Tarjeta SD)",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=digital+storage" }],
        price_estimate: { min: 50, max: 250 },
        category: "Storage",
        notes: {
            en: "Storage is so expensive that I'll even take an SD card in a USB enclosure over nothing right now.",
            es: "El almacenamiento está tan caro que hasta acepto una tarjeta SD con un adaptador USB en este momento.",
        },
        star_rating: 3,
        image: [
            "https://shop.sandisk.com/content/dam/store/en-us/assets/products/internal-storage/wd-black-sn750-nvme-ssd/gallery/without-heatsink/wd-black-sn750-nvme-ssd-noheatsink1.png",
            "https://www.westerndigital.com/content/dam/store/en-us/assets/products/internal-storage/wd-gold-sata-hdd/gallery/WD-GOLD-1TB.png",
            "https://wassets.insta360.com/store/34ccea3804c446feac77f24606427f4c/59712_00b30e9d-e237-4661-94d2-405bb34944ef.png",
        ],
    },
    {
        id: "flipper-zero",
        title: {
            en: "Flipper Zero",
            es: "Flipper Zero",
        },
        sources: [{ name: "Flipper Zero", url: "https://flipperzero.one/" }],
        price_estimate: 169,
        category: "RF Gear",
        notes: {
            en: "I've always wanted one. Multi-tool for hackers. RFID, NFC, IR, Sub-GHz — it does everything.",
            es: "Siempre he querido uno. Multi-herramienta pa' hackers. RFID, NFC, IR, Sub-GHz — hace de to'.",
        },
        star_rating: 3,
        image: "https://static0.xdaimages.com/wordpress/wp-content/uploads/2024/03/flipper-zero-product.png",
    },
    {
        id: "wifi-pineapple",
        title: {
            en: "Wi-Fi Pineapple",
            es: "Wi-Fi Pineapple",
        },
        sources: [{ name: "Hak5", url: "https://shop.hak5.org/products/wifi-pineapple" }],
        price_estimate: 99,
        category: "RF Gear",
        notes: {
            en: "Always needed one. Network auditing tool. Man-in-the-middle, rogue AP, the works.",
            es: "Siempre he necesitado uno. Herramienta de auditoría de redes. Man-in-the-middle, AP falso, to'.",
        },
        star_rating: 3,
        image: "https://sapsan-sklep.pl/cdn/shop/files/02ee6879d60553b6cf6cd2093af3ad55_700x700.png",
    },
    {
        id: "hackrf-one",
        title: {
            en: "HackRF One",
            es: "HackRF One",
        },
        sources: [{ name: "Great Scott Gadgets", url: "https://greatscottgadgets.com/hackrf/one/" }],
        price_estimate: 349,
        category: "RF Gear",
        notes: {
            en: "Software-defined radio. 1 MHz to 6 GHz. The little piece of shit is only as good as the antennas are.",
            es: "Radio definida por software. 1 MHz a 6 GHz. Esta vaina solo sirve si las antenas son buenas.",
        },
        star_rating: 3,
        image: "https://iotelectronics.co.za/wp-content/uploads/2025/06/HackRF-One-2.png",
    },
    {
        id: "sdr-antenna-pack",
        title: {
            en: "SDR Antenna (for HackRF)",
            es: "Antena SDR (pa'l HackRF)",
        },
        sources: [
            {
                name: "Amazon",
                url: "https://www.amazon.com/ANT500-Telescopic-Antenna-HackRF-Stick/dp/B01CQYZJV2/",
            },
        ],
        price_estimate: 50,
        category: "RF Gear",
        notes: {
            en: "Good SDR antenna. The HackRF is useless without proper antennas.",
            es: "Antena SDR buena. El HackRF no sirve sin antenas decentes.",
        },
        star_rating: 2.5,
        image: "https://pentesterstoolkit.com/cdn/shop/files/ANT500-500x500_1_-removebg-preview.png",
    },
    {
        id: "pocketterm35",
        title: {
            en: "Portable Terminal (WaveShare PocketTerm or Similar)",
            es: "Terminal Portátil (WaveShare PocketTerm o Similar)",
        },
        sources: [{ name: "Waveshare", url: "https://www.waveshare.com/pocketterm35.htm" }],
        price_estimate: { min: 85, max: 180 },
        category: "Hardware",
        notes: {
            en: "Portable terminal with small screen, keyboard, USB ports, and Ethernet. WaveShare PocketTerm35 is genuinely cool, but any portable terminal works.",
            es: "Terminal portátil con pantalla chiquita, teclado, puertos USB y Ethernet. El WaveShare PocketTerm35 es buenisimo, pero cualquier terminal portátil sirve.",
        },
        star_rating: 3,
        image: "https://img.alicdn.com/imgextra/i2/740676578/O1CN015bl9ef1ySmTWTOZjS_!!4611686018427384802-2-item_pic.png_q50.jpg_.webp",
    },
    {
        id: "ratcheting-wrench-set",
        title: {
            en: "Ratcheting Wrench Set",
            es: "Set de Llaves de Trinquete",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/gp/aw/d/B0CL1WBXG6" }],
        price_estimate: 50,
        category: "Tools",
        notes: {
            en: "Metric and imperial. For when the socket won't fit.",
            es: "Métrico e imperial. Pa' cuando el dado no entra.",
        },
        star_rating: 2.5,
        image: "https://media-www.canadiantire.ca/product/fixing/tools/sockets-wrenches/0580372/maximum-7-piece-stubby-flex-head-ratcheting-wrench-set-sae-2b4cb5c7-0718-4167-b3ee-cd9dfa697132.png",
    },
    {
        id: "knipex-pliers-wrench",
        title: {
            en: "Quality Pliers Wrench (Knipex or Similar)",
            es: "Pinza Ajustable de Calidad (Knipex o Similar)",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/KNIPEX-87-01-250-Capacity/dp/B000X4J2H0" }],
        price_estimate: 40,
        category: "Tools",
        notes: {
            en: "Adjustable pliers that won't mar surfaces. Knipex is the gold standard, but any quality brand works.",
            es: "Pinzas ajustables que no rayan superficies. Knipex es lo mejor, pero cualquier marca buena sirve.",
        },
        star_rating: 3,
        image: "https://static.wixstatic.com/media/8359bd_ed48ed6157af42788c4d393441c806dd~mv2.png",
    },
    {
        id: "knipex-cobra-xs",
        title: {
            en: "Small Precision Pliers (Knipex Cobra XS or Similar)",
            es: "Pinzas Pequeñas de Precisión (Knipex Cobra XS o Similar)",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/KNIPEX-Tools-Cobra-Water-Pliers/dp/B08DL764J3/" }],
        price_estimate: 30,
        category: "Tools",
        notes: {
            en: "Tiny but powerful. Perfect for electronics work. Knipex Cobra XS preferred, but any quality small pliers work.",
            es: "Pequeñas pero poderosas. Perfectas pa' trabajo de electrónica. Knipex Cobra XS si se puede, pero cualquier pinza chiquita buena sirve.",
        },
        star_rating: 2,
        image: "https://i.ebayimg.com/images/g/UXYAAOSwyaNfM62X/s-l640.png",
    },
    {
        id: "gerber-prybrid",
        title: {
            en: "EDC Pry Bar / Utility Tool",
            es: "Palanca EDC / Herramienta Multiuso",
        },
        sources: [
            { name: "Amazon", url: "https://www.amazon.com/Gerber-Prybrid-Utility-Green-30-001744/dp/B07DD69QN3" },
        ],
        price_estimate: 15,
        category: "Tools",
        notes: {
            en: "EDC pry bar and utility knife combo. Small enough to carry daily. Gerber Prybrid is solid, but any compact pry tool works.",
            es: "Palanca y navaja EDC. Lo suficientemente pequeña pa' llevarla diario. El Gerber Prybrid es bueno, pero cualquier palanca compacta sirve.",
        },
        star_rating: 2,
        image: "https://www.lamnia.com/images/525x525/gerber-prybrid-utility-green-51220-g3743-01.png",
    },
    {
        id: "digital-calipers",
        title: {
            en: "Digital Calipers",
            es: "Calibrador Digital",
        },
        sources: [
            {
                name: "Amazon",
                url: "https://www.amazon.com/Kynup-Measuring-Stainless-Waterproof-Protection/dp/B07X8JQ8L5",
            },
        ],
        price_estimate: 30,
        category: "Tools",
        notes: {
            en: "For precise measurements. Metric and imperial.",
            es: "Pa' mediciones precisas. Métrico e imperial.",
        },
        star_rating: 2,
        image: "https://media-www.canadiantire.ca/product/fixing/tools/metal-working/0581639/maximum-digital-caliper-ff62b0e7-3f3a-4294-be85-f1b47cd8b70d.png",
    },
    {
        id: "leatherman-arc",
        title: {
            en: "Premium Multi-Tool (Leatherman, Victorinox, etc.)",
            es: "Multi-Herramienta Premium (Leatherman, Victorinox, etc.)",
        },
        sources: [{ name: "Leatherman", url: "https://www.leatherman.com/products/arc" }],
        price_estimate: { min: 150, max: 300 },
        category: "Tools",
        notes: {
            en: "Premium multi-tool with quality blade and tools. Leatherman Arc is the dream (MagnaCut blade, arc plasma lighter), but Wave+ or Victorinox Spirit work too.",
            es: "Multi-herramienta premium con hoja y herramientas de calidad. El Leatherman Arc es el sueño (hoja MagnaCut, encendedor de plasma), pero el Wave+ o Victorinox Spirit también sirven.",
        },
        star_rating: 3,
        image: "https://www.eliteoutdoorgear.com.au/wp-content/uploads/2013/01/Wave-Plus-Tool-Guide.png",
    },
    {
        id: "fenix-pd36r-ace",
        title: {
            en: "Tactical Flashlight (Fenix, Streamlight, Whatever)",
            es: "Linterna Táctica (Fenix, Streamlight, Lo Que Sea)",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=fenix+pd36r" }],
        price_estimate: 90,
        category: "Tools",
        notes: {
            en: "Bright tactical flashlight, 3000+ lumens, USB-C rechargeable preferred. Fenix PD36R is great, but Streamlight or similar works too.",
            es: "Linterna táctica potente, 3000+ lúmenes, recargable USB-C si se puede. Fenix PD36R es brutal, pero Streamlight o similar también sirve.",
        },
        star_rating: 2.5,
        image: "https://www.fenixlight.com.cn/wp-content/uploads/2025/09/PD36R-ACE-08-1-768x672.png",
    },
    {
        id: "olight-arkpro",
        title: {
            en: "EDC Penlight (Olight, Streamlight, Whatever)",
            es: "Linterna de Bolígrafo EDC (Olight, Streamlight, Lo Que Sea)",
        },
        sources: [
            { name: "Amazon", url: "https://www.amazon.com/OLIGHT-Arkfeld-Pro-Flashlight-Rechargeable/dp/B0CW6SY7PJ" },
        ],
        price_estimate: 40,
        category: "Tools",
        notes: {
            en: "Small EDC penlight. Bright, magnetic tail preferred. Olight ArkPro is nice, but any quality penlight works.",
            es: "Linterna de bolígrafo EDC. Brillante, cola magnética si se puede. Olight ArkPro está bueno, pero cualquier linterna chiquita buena sirve.",
        },
        star_rating: 2,
        image: "https://longhorntactical.com/cdn/shop/files/fl-ol-arkpro_7f09e1c8-f9d3-4282-b1fa-67bbfe8c3a67.png",
    },
    // Soldering & Electronics
    {
        id: "quality-solder",
        title: {
            en: "Quality Solder (Lead-Free & Leaded)",
            es: "Soldadura de Calidad (Sin Plomo y con Plomo)",
        },
        sources: [
            { name: "Amazon", url: "https://www.amazon.com/Kester-24-6337-0007-Solder-3ounce-30feet/dp/B076GHCZZ1" },
        ],
        price_estimate: 25,
        category: "Electronics",
        notes: {
            en: "Good solder makes all the difference. Kester or Cardas preferred.",
            es: "La soldadura buena hace toda la diferencia. Kester o Cardas preferible.",
        },
        star_rating: 2.5,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Filrorwxhoopmjo5m.leadongcdn.com%2Fcloud%2FjkBplKoljpSRikknpnkjjq%2FDifferent-Weights-of-Solder-Wire.png",
    },
    {
        id: "flux",
        title: {
            en: "Flux Pen/Paste",
            es: "Flux en Pasta/Pluma",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/Kester-83-1000-0951-Solid-Clean-Flux/dp/B01JF57R9M" }],
        price_estimate: 15,
        category: "Electronics",
        notes: {
            en: "Makes soldering so much easier. Essential for SMD work.",
            es: "Hace la soldadura mucho más fácil. Esencial pa' trabajo SMD.",
        },
        star_rating: 2,
        image: [
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fblog.gotopac.com%2Fwp-content%2Fuploads%2F2023%2F09%2Findium-84191-pen-copy.png",
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftechiesms.com%2Fwp-content%2Fuploads%2F2024%2F02%2FSoldering-Flux-1.png",
        ],
    },
    {
        id: "pinecil-ts101",
        title: {
            en: "Pinecil / TS101 Smart Soldering Iron",
            es: "Cautín Inteligente Pinecil / TS101",
        },
        sources: [
            { name: "Amazon", url: "https://www.amazon.com/PINECIL-Smart-Mini-Portable-Soldering/dp/B096X6SG13" },
        ],
        price_estimate: 35,
        category: "Electronics",
        notes: {
            en: "USB-C powered, temperature control, portable. Way better than cheap irons.",
            es: "Alimentado por USB-C, control de temperatura, portátil. Mucho mejor que cautines baratos.",
        },
        star_rating: 3,
        image: [
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fhome-assistant-guide.com%2Fwp-content%2Fuploads%2F2023%2F07%2Fminiware_ts101_isolated.png&f=1&nofb=1&ipt=0ada50682785d2b3fcfe33012d5c5190a4f324fa714d5e24d9d0dc9a78c69a3f",
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdatakonsulten.se%2Fwp-content%2Fuploads%2F2025%2F10%2F61CShxhtzL._AC_SX679_-1.png&f=1&nofb=1&ipt=6bc7286ec485c033cc1f0610609c638916f6bd512c44308ad7b1c788cd27ad68",
        ],
    },
    {
        id: "helping-hands",
        title: {
            en: "Helping Hands Soldering Stand",
            es: "Soporte de Manos de Ayuda",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/Helping-Hands-Soldering-Third-Hand/dp/B07JWFJX9V" }],
        price_estimate: 20,
        category: "Electronics",
        notes: {
            en: "Holds PCBs and components while soldering. Adjustable arms.",
            es: "Sostiene PCBs y componentes mientras soldás. Brazos ajustables.",
        },
        star_rating: 2,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.radioparts.com.au%2Fimages%2FProductImages%2Ff%2F52801565.png&f=1&nofb=1&ipt=9e17b88bed2570eb7a9377c0677a07417c4287a96bb93b3be0dda916d4f99789",
    },
    {
        id: "magnetic-project-mat",
        title: {
            en: "Magnetic Project Mat",
            es: "Tapete Magnético de Proyecto",
        },
        sources: [
            {
                name: "Amazon",
                url: "https://www.amazon.com/STREBITO-Soldering-Resistant-Magnetic-Electronic/dp/B0D4TMNG7F",
            },
        ],
        price_estimate: 30,
        category: "Electronics",
        notes: {
            en: "Keeps screws organized during teardowns. Heat resistant.",
            es: "Mantiene los tornillos organizados durante desarmes. Resistente al calor.",
        },
        star_rating: 2,
        image: "https://cdn.inet.se/product/688x386/6906866_5.png",
    },
    {
        id: "contact-cleaner",
        title: {
            en: "QD Contact Cleaner",
            es: "Limpiador de Contactos QD",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/CRC-Industries-03130-Contact-Cleaner/dp/B000RY5D0G" }],
        price_estimate: 10,
        category: "Electronics",
        notes: {
            en: "Cleans potentiometers, switches, connectors. Dries fast.",
            es: "Limpia potenciómetros, switches, conectores. Se seca rápido.",
        },
        star_rating: 1.5,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.ftfarfan.com%2Fwp-content%2Fuploads%2F2023%2F08%2FQD_CONTACT_CLEANER_11OZ-min-600x600.png&f=1&nofb=1&ipt=5f955d5a4f0407f0e4271149550816530e3b08f64039dc50deab73ebbb960e7b",
    },
    // Homelab, Storage & Networking
    {
        id: "velcro-cable-ties",
        title: {
            en: "Velcro Cable Ties",
            es: "Amarras de Cable Velcro",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=velcro+cable+ties" }],
        price_estimate: 15,
        category: "Hardware",
        notes: {
            en: "Reusable, adjustable. For cable management.",
            es: "Reusables, ajustables. Pa' manejo de cables.",
        },
        star_rating: 1.5,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.sogetronic.fr%2F12156-large_default%2Fattaches-cables-velcro-pack-de-10.jpg&f=1&nofb=1&ipt=7c519a176cf7770233daf3bbec01a8cb903b8665328459d0624ac3157f3c871b",
    },
    // Additional RF & Wireless Research
    {
        id: "limesdr",
        title: {
            en: "LimeSDR or BladeRF",
            es: "LimeSDR o BladeRF",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=limesdr" }],
        price_estimate: 300,
        category: "RF Gear",
        notes: {
            en: "Full-duplex SDR. Transmit and receive simultaneously.",
            es: "SDR full-duplex. Transmite y recibe simultáneamente.",
        },
        star_rating: 3,
        image: [
            "https://i.imgur.com/W6MiTZ5.png",
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.haleytech.com%2Fimages%2F2022%2F01%2F02%2Fbladerf_micro-removebg-preview-1.png&f=1&nofb=1&ipt=e9a946afe261149a26d6ed55349c4a468c21d4039196847fbcc958e6453fa59b",
        ],
    },
    {
        id: "faraday-bag",
        title: {
            en: "RF-Blocking Faraday Bag",
            es: "Bolsa Faraday Bloqueadora de RF",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=faraday+bag" }],
        price_estimate: 30,
        category: "RF Gear",
        notes: {
            en: "Blocks all wireless signals. For forensics and privacy.",
            es: "Bloquea todas las señales inalámbricas. Pa' forense y privacidad.",
        },
        star_rating: 2,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsecuritybase.com.au%2Fcdn%2Fshop%2Ffiles%2FLarge_Faraday_Pouch.png%3Fv%3D1763977006%26width%3D1080&f=1&nofb=1&ipt=3d78dee8960bedc01b4d498b2375c86240b17dfd0fd07a94e387c4a4a79558f7",
    },
    // Hardware Hacking & Covert Tools
    {
        id: "the-poom",
        title: {
            en: "The POOM",
            es: "The POOM",
        },
        sources: [{ name: "Tindie", url: "https://www.tindie.com/products/aprbrother/the-poom/" }],
        price_estimate: 90,
        category: "RF Gear",
        notes: {
            en: "ESP32-based multi-tool. WiFi deauth, BLE spam, IR, the works.",
            es: "Multi-herramienta basada en ESP32. WiFi deauth, BLE spam, IR, to'.",
        },
        star_rating: 2.5,
        image: "https://poom.stellar-iot.com/assets/poom-device-gamer-DO1RfnDU.png",
    },
    {
        id: "m5stack-cardputer",
        title: {
            en: "M5Stack Cardputer",
            es: "M5Stack Cardputer",
        },
        sources: [{ name: "M5Stack", url: "https://shop.m5stack.com/products/m5stack-cardputer-kit-w-m5stamps3" }],
        price_estimate: 60,
        category: "Hardware",
        notes: {
            en: "Pocket ESP32 computer with keyboard. Perfect for portable projects.",
            es: "Computadora ESP32 de bolsillo con teclado. Perfecto pa' proyectos portátiles.",
        },
        star_rating: 2.5,
        image: "https://i.imgur.com/OWN2kEL.png",
    },
    {
        id: "hak5-omg-cable",
        title: {
            en: "Hak5 O.MG Cable",
            es: "Hak5 O.MG Cable",
        },
        sources: [{ name: "Hak5", url: "https://shop.hak5.org/products/omg-cable" }],
        price_estimate: 120,
        category: "RF Gear",
        notes: {
            en: "Looks like a charging cable. It's not. Remote keylogger and payload delivery.",
            es: "Parece un cable de carga. No lo es. Keylogger remoto y entrega de payload.",
        },
        star_rating: 2.5,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsapsan-sklep.pl%2Fcdn%2Fshop%2Fproducts%2Fomg-cable-hak5-692011_700x700.webp%3Fv%3D1683699098&f=1&nofb=1&ipt=5b105fa655543bdbcecdebb3210f95092b2aabb66d06307454109abfd2fce807",
    },
    {
        id: "bash-bunny",
        title: {
            en: "Hak5 Bash Bunny Mark II",
            es: "Hak5 Bash Bunny Mark II",
        },
        sources: [{ name: "Hak5", url: "https://shop.hak5.org/products/bash-bunny" }],
        price_estimate: 120,
        category: "RF Gear",
        notes: {
            en: "USB attack platform. Emulates keyboards, storage, ethernet.",
            es: "Plataforma de ataque USB. Emula teclados, almacenamiento, ethernet.",
        },
        star_rating: 2.5,
        image: "https://i.imgur.com/K6Rv349.png",
    },
    {
        id: "tigard",
        title: {
            en: "Tigard Multi-Protocol Tool",
            es: "Tigard Multi-Protocolo",
        },
        sources: [{ name: "Crowd Supply", url: "https://www.crowdsupply.com/securinghw/tigard" }],
        price_estimate: 50,
        category: "Hardware",
        notes: {
            en: "Open-source hardware hacking tool. SPI, I2C, UART, JTAG, SWD.",
            es: "Herramienta de hacking de hardware open-source. SPI, I2C, UART, JTAG, SWD.",
        },
        star_rating: 2.5,
        image: "https://hackster.imgix.net/uploads/attachments/1212731/image_MzsEdMupwO.png?auto=compress%2Cformat&w=1200",
    },
    {
        id: "chameleon-ultra",
        title: {
            en: "Chameleon Ultra",
            es: "Chameleon Ultra",
        },
        sources: [
            {
                name: "Amazon",
                url: "https://www.amazon.com/Chameleon-Emulator-ChameleonUltra-Solution-Control/dp/B0CFJMQ58Z",
            },
        ],
        price_estimate: 40,
        category: "RF Gear",
        notes: {
            en: "RFID/NFC emulator. Clone and emulate cards. Research tool.",
            es: "Emulador RFID/NFC. Clona y emula tarjetas. Herramienta de investigación.",
        },
        star_rating: 2.5,
        image: "https://sapsan-sklep.pl/cdn/shop/products/proxgrind-chameleon-ultra-794496_700x700.webp?v=1694866570",
    },
    // DIY Hardware Kits
    {
        id: "diy-guitar-pedal",
        title: {
            en: "DIY Guitar Pedal Kit",
            es: "Kit de Pedal de Guitarra DIY",
        },
        sources: [{ name: "Aion", url: "https://aionfx.com/kits/" }],
        price_estimate: 40,
        category: "Electronics",
        notes: {
            en: "Build your own effects pedal. Learn analog circuits.",
            es: "Construye tu propio pedal de efectos. Aprende circuitos analógicos.",
        },
        star_rating: 2,
        image: ["https://i.imgur.com/wGgvgi8.png", "https://i.imgur.com/4NN1jZx.png"],
    },
    {
        id: "korg-nts1",
        title: {
            en: "Korg Nu:Tekt NTS-1",
            es: "Korg Nu:Tekt NTS-1",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=korg+nts-1" }],
        price_estimate: 100,
        category: "Electronics",
        notes: {
            en: "DIY synth kit. Programmable, effects, oscillator. Sounds incredible.",
            es: "Kit de sintetizador DIY. Programable, efectos, oscilador. Suena increíble.",
        },
        star_rating: 2.5,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.ctrl-mod.com%2Fcdn%2Fshop%2Ffiles%2Fkorg-nts-1-mkii-3-ctrl-mod.png%3Fv%3D1706564921%26width%3D750&f=1&nofb=1&ipt=17d5cae9d70d63aa717bf9c73add7c51e97acdd92b5204fcb7db3dbc5a7b7bc9",
    },
    // Guitar & Pedalboard
    {
        id: "guitar-pedals-collection",
        title: {
            en: "Guitar Effects Pedals (ANY)",
            es: "Pedales de Efectos de Guitarra (CUALQUIERA)",
        },
        sources: [{ name: "Amazon", url: "https://www.musiciansfriend.com/effects-pedals" }],
        price_estimate: { min: 100, max: 250 },
        category: "Electronics",
        notes: {
            en: "ProCo RAT 2, Boss CE-2W Chorus, Boss DD-8, Digitech Drop pedal. I REALLY NEED A DROP PEDAL.",
            es: "ProCo RAT 2, Boss CE-2W Chorus, Boss DD-8, pedal Digitech Drop. DE VERDAD NECESITO UN DROP PEDAL.",
        },
        star_rating: 3,
        image: [
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.stars-music.com%2Fmedias%2Fpro-co%2Fcropped-rat2-distortion-84148.png&f=1&nofb=1&ipt=9b630bfbfc36c06fe800cf6c9dc504549ec696028e1c03228fd2afe5064cdbb7",
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.shopify.com%2Fs%2Ffiles%2F1%2F1750%2F3791%2Fproducts%2FCE-2w_1024x1024.png%3Fv%3D1508430350&f=1&nofb=1&ipt=042d9cbe999a07610951a9a2295745e2304b2958e82d3fbad77dc4348009c190",
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcapitalmusical.com.mx%2Fcdn%2Fshop%2Ffiles%2FDD-8-2_webp.webp%3Fv%3D1776118025%26width%3D860&f=1&nofb=1&ipt=82b5d17c10f2b71e87cbb2f69635ab20883be42de8541871496bda4c29c5c9ee",
            "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fguitarfactory.com.au%2Fcdn%2Fshop%2Ffiles%2FDigiTechDropBlackEdition12-ddb936efe469d5ab.png%3Fv%3D1758870186&f=1&nofb=1&ipt=522b136a78c28493e59f855c0fa5b10ef67ccad82353341504d0322b6ed53d32",
        ],
    },
    {
        id: "instrument-cables",
        title: {
            en: "Premium 1/4-inch Instrument Cables",
            es: 'Cables de Instrumento 1/4" Premium',
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=instrument+cable" }],
        price_estimate: { min: 15, max: 40 },
        category: "Electronics",
        notes: {
            en: "High-quality shielded cables. For guitar and pedalboard. No crackle, no buzz.",
            es: "Cables blindados de alta calidad. Pa' guitarra y pedalboard. Sin ruido, sin zumbido.",
        },
        star_rating: 2,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fedge.rode.com%2Fimages%2Fproducts%2Fvariants%2F119%2Frode-trs-34-coiled-cable-3m-trs-3840x2160-rgb-2000x2000-724898e.png&f=1&nofb=1&ipt=dac3769d97e92b7a050786c97eee0367fd16051f6f50e603975d30f473e86c44",
    },
    // Retro Tech & Lab Gear
    {
        id: "vintage-analog-oscilloscope",
        title: {
            en: "Vintage Analog Oscilloscope",
            es: "Osciloscopio Analógico Vintage",
        },
        sources: [{ name: "eBay", url: "https://www.ebay.com/sch/i.html?_nkw=vintage+oscilloscope" }],
        price_estimate: 200,
        category: "Electronics",
        notes: {
            en: "CRT display. Glowing phosphor traces. So FUCKING cool. Hitachi, Tektronix, HP preferred.",
            es: "Pantalla CRT. Trazas de fósforo brillantes. Demasiado cool. Hitachi, Tektronix, HP preferible.",
        },
        star_rating: 3,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fascendelec.com%2Fwp-content%2Fuploads%2Fsites%2F4%2F2023%2F05%2Fd.png&f=1&nofb=1&ipt=d2d425bb82949315f7b989fe49dfd63c1fc38a821e28dc1a7a9d957ad5faaa73",
    },
    {
        id: "nixie-tube-gadgets",
        title: {
            en: "Nixie Tube Clock/Gadgets",
            es: "Reloj/Gadgets de Tubo Nixie",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=nixie+tube+clock" }],
        price_estimate: 120,
        category: "Electronics",
        notes: {
            en: "Retro vacuum tube displays. Warm orange glow. Desktop eye candy.",
            es: "Pantallas de tubo de vacío retro. Brillo naranja cálido. Eye candy de escritorio.",
        },
        star_rating: 2.5,
        image: [
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftechshoplab.com%2Fcdn%2Fshop%2Ffiles%2FEleksTubeIPSPR2TransparentEdition_5.webp%3Fv%3D1768574901%26width%3D1024&f=1&nofb=1&ipt=ac8cd8fe828c8b9ac82a35e1b2455787b42847400cfd219e0bf3e7cda183030b",
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.facer.io%2Foriginal%2F3220fba920252f1fb812f89dcc9749a6_GAUSS-NIXIE-preview-round.png&f=1&nofb=1&ipt=cf006d8e2b6781982435b837a43d530d996fea00104cd9e9fc7ff880251e031b",
        ],
    },
    {
        id: "thermal-camera-phone",
        title: {
            en: "Thermal Imaging Phone Camera",
            es: "Cámara Térmica pa' Teléfono",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=seek+thermal+camera+phone" }],
        price_estimate: 250,
        category: "Electronics",
        notes: {
            en: "Plugs into phone. See heat signatures. For electronics debugging and finding heat leaks.",
            es: "Se conecta al teléfono. Ve firmas de calor. Pa' depurar electrónica y encontrar fugas de calor.",
        },
        star_rating: 2.5,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ffieldinstruments.lk%2Fstorage%2Fproduct-images%2F5847-0.png&f=1&nofb=1&ipt=6302c6f7fad159da42b424f33609dd07246706d6a0450f9537ed95dd2819bf72",
    },
    {
        id: "premium-multimeter",
        title: {
            en: "Premium Multimeter",
            es: "Multímetro Premium",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=fluke+multimeter" }],
        price_estimate: 150,
        category: "Electronics",
        notes: {
            en: "Fluke or similar. Auto-ranging, true RMS, backlight. The tool that doesn't lie.",
            es: "Fluke o similar. Auto-ranging, true RMS, luz de fondo. La herramienta que no miente.",
        },
        star_rating: 2.5,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fadmin.iconic.com.bd%2Fstorage%2Fimages%2Fgallery%2Fproducts%2Ffluke%2Fdigital-multimeters%2FFluke-15B%2B-Digital-Multimeter-1600671582.png&f=1&nofb=1&ipt=7dd6bba308d608c4d761939bc29b109b3fd465b1478dfbc6e4697a54f5d987dd",
    },
    // The Holy Grail & Digital Bounties
    {
        id: "salami-wallet",
        title: {
            en: "salami.org Windows File Explorer Wallet",
            es: "Billetera Windows File Explorer salami.org",
        },
        sources: [{ name: "salami.org", url: "https://salami.org/product/windows-file-explorer-wallet" }],
        price_estimate: 50,
        category: "Hardware",
        notes: {
            en: "Windows Vista/7 File Explorer as a wallet. It's not a want. It's a NEED. I swear it's justified.",
            es: "Windows Vista/7 File Explorer como billetera. No es un deseo. Es una NECESIDAD. Juro que está justificado.",
        },
        star_rating: 3,
        image: "https://i.imgur.com/ThrF1v6.png",
    },
    {
        id: "gift-cards",
        title: {
            en: "Gift Cards (any)",
            es: "Tarjetas de Regalo (cualquier vaina)",
        },
        sources: [{ name: "Amazon", url: "https://www.amazon.com/s?k=gift+card" }],
        price_estimate: { min: 10, max: 100 },
        category: "Electronics",
        notes: {
            en: "Any amount, anything. Amazon, eBay, Visa... doesn't matter. Solves the 'what should I gift him' problem easily.",
            es: "Cualquier cantidad, cualquiera. Sea Amazon, eBay, Visa... no importa. Resuelve el problema de 'que diantre le regalo' facil.",
        },
        star_rating: 2,
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.kudoboard.com%2Fcdn-cgi%2Fimage%2Ffit%253Dcover%252Cformat%253Davif%252Cquality%253D85%252Cwidth%253D480%252Cheight%253D479%252Conerror%253Dredirect%2Fwp-content%2Fuploads%2F2023%2F10%2Fkudoboard-gift-card-2.png&f=1&nofb=1&ipt=3e98119b1ff7ef3bffc7591a0254943a18a6211596a65846e1980c5af6097e5c",
    },
];
