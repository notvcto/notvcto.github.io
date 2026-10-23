// Bilingual resume data. `L` is a localized string leaf — one tree, both
// languages side by side, so a missing translation is a type error.

export type L = { en: string; es: string; };

export type Lang = "en" | "es";

export interface ResumeData {
    name: string;
    title: L;
    contact: {
        email: string;
        site: string;
        github: string;
        phone?: string;
        linkedin?: string;
        location?: L;
        availability?: L;
    };
    summary: L;
    experience: {
        role: L;
        org: string;
        period: L;
        bullets: L[];
    }[];
    skills: {
        category: L;
        items: string[];
    }[];
    education: {
        credential: L;
        org: string;
        period: L;
        detail?: L;
    }[];
}

// UI chrome labels (section headings, buttons).

export const ui = {
    resume: { en: "Resume", es: "Currículum" },
    print: { en: "Print", es: "Imprimir" },
    phone: { en: "Phone", es: "Teléfono" },
    phoneForPrint: { en: "Phone for print", es: "Teléfono para imprimir" },
    dominicanId: { en: "Dominican ID", es: "Cédula" },
    summary: { en: "Summary", es: "Resumen" },
    experience: { en: "Experience", es: "Experiencia" },
    skills: { en: "Skills", es: "Habilidades" },
    education: { en: "Education", es: "Educación" },
} satisfies Record<string, L>;

export const resume: ResumeData = {
    name: "Victor Soto",
    title: {
        en: "Security Researcher & Systems Programmer",
        es: "Investigador de Seguridad y Programador de Sistemas",
    },
    contact: {
        email: "contact@notvc.to",
        site: "notvc.to",
        github: "github.com/notvcto",
        // phone: "",       // TODO: add if you want it on the public resume
        // linkedin: "",    // TODO: add if you have/want one listed
        location: { en: "Baní, Dominican Republic", es: "Baní, República Dominicana" },
        availability: {
            en: "US citizen · Remote / on-site · Open to relocation (DR & US)",
            es: "Ciudadano estadounidense · Remoto / presencial · Disponible para reubicación (RD y EE. UU.)",
        },
    },
    summary: {
        en: "Independent security researcher and systems programmer building low-level software, security tools, and self-hosted infrastructure across Rust, TypeScript, Python, C, and shell. Projects include Ferber, a capability-based microkernel for RISC-V64 and x86-64, and VWH, a cryptographic artifact-verification tool and format. Reported vulnerabilities to Riot Games Security and programs run by the U.S. Department of Defense, Agoda, and Neon. Experience in firmware reverse engineering, GPON and network administration, and operating Linux services. Bilingual English/Spanish.",
        es: "Investigador de seguridad y programador de sistemas independiente. Desarrollo software de bajo nivel, herramientas de seguridad e infraestructura autoalojada con Rust, TypeScript, Python, C y shell. Entre mis proyectos están Ferber, un microkernel basado en capacidades para RISC-V64 y x86-64, y VWH, una herramienta y especificación para la verificación criptográfica de artefactos. Presenté reportes de vulnerabilidades a Riot Games Security y a programas del Departamento de Defensa de EE. UU., Agoda y Neon. Experiencia en ingeniería inversa de firmware, administración de redes y GPON, y operación de servicios Linux. Bilingüe en inglés y español.",
    },
    experience: [
        {
            role: {
                en: "Independent Security Researcher — Bug Bounty & Vulnerability Research",
                es: "Investigador de Seguridad Independiente — Bug Bounty e Investigación de Vulnerabilidades",
            },
            org: "HackerOne / VDP programs",
            period: { en: "2025 — Present", es: "2025 — Actualidad" },
            bullets: [
                {
                    en: "Found and reported a cross-platform persistent denial-of-service logic flaw in the Riot Games ecosystem. Triaged by Riot Games Security; remediation coordinated with their engineering teams.",
                    es: "Encontré y reporté una falla lógica de denegación de servicio persistente y multiplataforma en el ecosistema de Riot Games. Validada por Riot Games Security; remediación coordinada con sus equipos de ingeniería.",
                },
                {
                    en: "Submitted vulnerability reports to the U.S. Department of Defense VDP, Agoda, and Neon. Coordinated disclosure, full reproduction steps, negative controls.",
                    es: "Presenté reportes de vulnerabilidades al VDP del Departamento de Defensa de EE. UU., Agoda y Neon. Divulgación coordinada, pasos de reproducción completos, controles negativos.",
                },
                {
                    en: "Reverse-engineered ISP-deployed router firmware (ZTE F670L): decrypted vendor configuration files, found an undocumented privileged account and exposed infrastructure credentials. Published the methodology.",
                    es: "Ingeniería inversa del firmware de un router de ISP (ZTE F670L): descifré los archivos de configuración del fabricante, encontré una cuenta privilegiada no documentada y credenciales de infraestructura expuestas. Publiqué la metodología.",
                },
                {
                    en: "Discovered and coordinated disclosure of a high-severity (CVSS 8.8) authentication weakness affecting an entire national ISP's subscriber base: GPON credentials derivable from data broadcast in the clear. Withheld the full technical report and used a PGP-signed initial contact when the national CSIRT's published encryption key was found expired, maintaining responsible disclosure standards despite the recipient's own infrastructure gaps.",
                    es: "Descubrí y coordiné la divulgación de una debilidad de autenticación de gravedad alta (CVSS 8.8) que afecta a toda la base de abonados de un ISP nacional: credenciales GPON derivables de datos transmitidos en claro. Retuve el reporte técnico completo y usé un primer contacto firmado con PGP al encontrar que la clave de cifrado publicada por el CSIRT nacional había expirado, manteniendo estándares de divulgación responsable pese a las brechas de infraestructura del propio receptor.",
                },
            ],
        },
        {
            role: {
                en: "Independent Systems & Network Administrator",
                es: "Administrador de Sistemas y Redes Independiente",
            },
            org: "notvcto",
            period: { en: "2024 — Present", es: "2024 — Actualidad" },
            bullets: [
                {
                    // Folded: full service inventory from the live OCI box (ps aux / ss -tlnp / free -h),
                    // merged with the former separate Gatus/ntfy bullet. LiveKit/MatrixRTC runs on a
                    // separate dedicated box, kept as its own line below rather than implying it's on this one.
                    en: "Design and operate a multi-service self-hosted stack on a single ~1GB Oracle Cloud VPS: Tuwunel Matrix homeserver with a dedicated Matrix Authentication Service and CouchDB backing store, PostgreSQL, a Caddy reverse proxy, Vaultwarden (password vault), an Ergo IRC daemon, a custom-built CMS powering my blog, and a Gatus/ntfy monitoring and alerting stack covering uptime and health checks across all self-hosted services — over a dozen services running concurrently under 500MB RAM.",
                    es: "Diseño y opero una pila de servicios auto-alojados en un único VPS de Oracle Cloud de ~1GB: servidor Matrix Tuwunel con un servicio de autenticación dedicado y CouchDB como almacenamiento, PostgreSQL, un proxy inverso Caddy, Vaultwarden (gestor de contraseñas), un daemon IRC Ergo, un CMS propio que impulsa mi blog, y una pila de monitoreo y alertas con Gatus/ntfy que cubre el tiempo de actividad y verificaciones de estado de todos los servicios auto-alojados — más de una docena de servicios ejecutándose simultáneamente con menos de 500MB de RAM.",
                },
                {
                    en: "Operate a separate LiveKit-based voice/video box (MatrixRTC) providing real-time calling for the Matrix homeserver.",
                    es: "Opero un servidor independiente basado en LiveKit (MatrixRTC) que provee llamadas en tiempo real para el servidor Matrix.",
                },
                {
                    en: "Redesigning home network infrastructure after finding critical vulnerabilities in ISP-provided equipment. Successfully tested live internet connectivity with a Huawei MA5671A GPON SFP ONU; planning MikroTik hEX S routing for the replacement network.",
                    es: "Rediseño de la infraestructura de red doméstica tras encontrar vulnerabilidades críticas en el equipo del ISP. Comprobé la conexión real a internet mediante un módulo GPON SFP ONU Huawei MA5671A; planifico el enrutamiento con MikroTik hEX S para la nueva red.",
                },
                {
                    en: "Manage DNS, WireGuard VPN tunnels, and TLS certificate lifecycles across multiple ARM and x86 VPS instances.",
                    es: "Administro DNS, túneles VPN WireGuard, y el ciclo de vida de certificados TLS en múltiples instancias VPS ARM y x86.",
                },
            ],
        },
        {
            role: {
                en: "Open Source Developer & Maintainer",
                es: "Desarrollador y Mantenedor de Código Abierto",
            },
            org: "notvcto",
            period: { en: "2024 — Present", es: "2024 — Actualidad" },
            bullets: [
                {
                    en: "Designed and implemented Ferber (github.com/notvcto/ferber), an open-source capability-based Rust microkernel targeting RISC-V64 (OpenSBI) and x86-64 (UEFI). Built firmware-derived physical-memory management, virtual memory and VMO-backed mappings, and userspace privilege transitions. Booted on both architectures in QEMU and verified earlier kernel milestones on physical x86-64 hardware.",
                    es: "Diseñé e implementé Ferber (github.com/notvcto/ferber), un microkernel de código abierto basado en capacidades, escrito en Rust para RISC-V64 (OpenSBI) y x86-64 (UEFI). Implementé gestión de memoria física basada en los mapas del firmware, memoria virtual y mapeos respaldados por VMOs, y transiciones a modo usuario. Arranqué ambas arquitecturas en QEMU y validé hitos anteriores del kernel en hardware x86-64 real.",
                },
                {
                    en: "Implemented explicit-rights capability handles with delegation, attenuation, and hierarchical revocation; bidirectional IPC with capability transfer, transactional failure handling, blocking receives, and a cooperative resident scheduler. Tested lifetime and resource-accounting invariants across repeated process teardown.",
                    es: "Implementé manejadores de capacidades con permisos explícitos, delegación, atenuación y revocación jerárquica; IPC bidireccional con transferencia de capacidades, manejo transaccional de fallos, recepción bloqueante y un planificador cooperativo de tareas residentes. Verifiqué invariantes de vida útil y contabilidad de recursos tras múltiples ciclos de finalización de procesos.",
                },
                {
                    en: "Built an ELF64 userspace loader and a versioned, cross-architecture Rust startup ABI with an explicitly delegated bootstrap channel. Added separately delivered boot executables (RISC-V initrd and x86-64 UEFI payload), protected boot-payload mappings, and negative protocol tests. The external-payload path passed cross-architecture QEMU CI; physical-hardware validation is pending.",
                    es: "Implementé un cargador ELF64 para espacio de usuario y una ABI de inicio de Rust versionada y común a ambas arquitecturas, con un canal de arranque delegado explícitamente. Añadí ejecutables entregados por separado (initrd en RISC-V y carga UEFI en x86-64), mapeos protegidos y pruebas negativas del protocolo. La ruta de carga externa superó la CI con QEMU en ambas arquitecturas; falta validarla en hardware físico.",
                },
                {
                    en: "Created VWH, a Rust CLI and open standard for cryptographic verification and accountability of digital artifacts. Public key registry, formal format specification.",
                    es: "Creé VWH, una CLI en Rust y un estándar abierto para la verificación criptográfica y trazabilidad de artefactos digitales. Registro público de claves, especificación formal de formato.",
                },
                {
                    en: "Building Zero, an applied-ML research project training a security reasoning model on CTF problems through adversarial self-play (GRPO), data pipeline included.",
                    es: "Desarrollo Zero, un proyecto de investigación en ML aplicado que entrena un modelo de razonamiento de seguridad con problemas CTF mediante self-play adversarial (GRPO), pipeline de datos incluido.",
                },
                {
                    // CORRECTED — vsh is spec-phase, not shipped (no src/ yet in the repo). Original line
                    // said "Ship and maintain... a POSIX shell in Rust (vsh)", which overstated its status.
                    en: "Ship and maintain systems tooling: a Hyprland/Wayland desktop ported to Apple Silicon for Asahi Linux, media-processing CLIs. Designing vsh, a POSIX-compatible shell in Rust with multi-syntax command support (formal specification published; implementation in progress).",
                    es: "Publico y mantengo herramientas de sistemas: un escritorio Hyprland/Wayland portado a Apple Silicon para Asahi Linux, CLIs de procesamiento multimedia. Diseño vsh, un shell compatible con POSIX en Rust con soporte de sintaxis múltiple (especificación formal publicada; implementación en progreso).",
                },
                {
                    // NEW
                    en: "Built rscapt, a Rust daemon and dual-TUI application that watches an OBS replay buffer, automatically upscales clips to 1440p (Lanczos), and offers motion interpolation, NVENC/x265/AV1 compression, and one-click sharing. Cross-compiled for Windows from Linux via Zig; automated release builds via GitHub Actions.",
                    es: "Desarrollé rscapt, un daemon y aplicación de doble TUI en Rust que monitorea el buffer de repetición de OBS, escala automáticamente los clips a 1440p (Lanczos), y ofrece interpolación de movimiento, compresión NVENC/x265/AV1 y compartición con un clic. Compilación cruzada para Windows desde Linux vía Zig; builds de lanzamiento automatizados con GitHub Actions.",
                },
                {
                    // NEW
                    en: "Built compress-video, an interactive Bash/FFmpeg TUI for video compression: codec selection (H.265, AV1, HEVC NVENC), quality presets, optional trimming, live progress with ETA, and a before/after size report on completion.",
                    es: "Desarrollé compress-video, una TUI interactiva en Bash/FFmpeg para compresión de video: selección de códec (H.265, AV1, HEVC NVENC), preajustes de calidad, recorte opcional, progreso en vivo con ETA, y un reporte de tamaño antes/después al finalizar.",
                },
            ],
        },
    ],
    skills: [
        {
            category: { en: "Languages", es: "Lenguajes" },
            items: ["Rust", "TypeScript", "Python", "Shell", "C"],
        },
        {
            category: { en: "Security", es: "Seguridad" },
            items: [
                "Vulnerability Research",
                "Reverse Engineering",
                "Firmware Analysis",
                "Applied Cryptography",
                "Coordinated Disclosure",
            ],
        },
        {
            category: { en: "Networking", es: "Redes" },
            items: ["GPON", "MikroTik RouterOS", "WireGuard", "DNS", "Reverse Proxying (Caddy)", "Network Design"],
        },
        {
            category: { en: "Systems", es: "Sistemas" },
            items: [
                "Linux",
                "OS / Kernel Development",
                "RISC-V",
                "ARM64",
                "Wayland",
                "POSIX",
                "systemd",
                "Cloud VPS Administration",
                "Monitoring & Alerting",
                "CI/CD",
                "GitHub Actions",
                "Automated Testing",
                "Cross-Compilation"
            ],
        },
        {
            category: { en: "Databases", es: "Bases de Datos" },
            items: ["CouchDB", "PostgreSQL", "MongoDB", "Distributed Data Sync"],
        },
        // The "yes, I can also use Excel" section — for recruiters skimming past "capability-based microkernel"
        {
            category: { en: "Office & Productivity", es: "Ofimática y Productividad" },
            items: [
                "Microsoft Office (Word, Excel, PowerPoint)",
                "Google Workspace (Docs, Sheets, Slides)",
                "Notion",
                "Spreadsheet & Data Cleanup (CSV)",
                "Email & Calendar Management",
                "Windows & macOS",
            ],
        },
        {
            category: { en: "Spoken", es: "Idiomas" },
            items: ["English (native)", "Spanish (native)", "French (basic)"],
        },
    ],
    education: [
        {
            credential: { en: "High School Diploma", es: "Diploma de Educación Secundaria" },
            org: "Acellus Academy — Kansas City, MO (WASC accredited)",
            period: { en: "2024 — 2026", es: "2024 — 2026" },
            detail: {
                en: "GPA 3.98/4.00 · Coursework incl. AP Computer Science Principles, Intro to Java, Electrical Technology I–II",
                es: "GPA 3.98/4.00 · Cursos incl. AP Computer Science Principles, Introducción a Java, Tecnología Eléctrica I–II",
            },
        },
        {
            credential: {
                en: "National Recognition — Highest Grade, Computer Science Workshop",
                es: "Reconocimiento Nacional — Más Alta Calificación, Taller de Informática",
            },
            org: "Dirección General de las Escuelas Vocacionales de las FF.AA. y de la P.N. — Escuela Vocacional de Baní",
            period: { en: "2025", es: "2025" },
            detail: {
                en: "Awarded the highest grade nationwide in the Informática workshop for 2025.",
                es: "Obtuve la más alta calificación a nivel nacional en el taller de Informática correspondiente al año 2025.",
            },
        },
    ],
};
