// Bilingual resume data. `L` is a localized string leaf — one tree, both
// languages side by side, so a missing translation is a type error.
export type L = { en: string; es: string }
export type Lang = "en" | "es"

export interface ResumeData {
  name: string
  title: L
  contact: {
    email: string
    site: string
    github: string
    location?: L
    availability?: L
  }
  summary: L
  experience: {
    role: L
    org: string
    period: L
    bullets: L[]
  }[]
  skills: {
    category: L
    items: string[]
  }[]
  education: {
    credential: L
    org: string
    period: L
    detail?: L
  }[]
}

// UI chrome labels (section headings, buttons).
export const ui = {
  resume: { en: "Resume", es: "Currículum" },
  print: { en: "Print", es: "Imprimir" },
  summary: { en: "Summary", es: "Resumen" },
  experience: { en: "Experience", es: "Experiencia" },
  skills: { en: "Skills", es: "Habilidades" },
  education: { en: "Education", es: "Educación" },
} satisfies Record<string, L>

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
    location: { en: "Baní, Dominican Republic", es: "Baní, República Dominicana" },
    availability: {
      en: "US citizen · Remote / on-site · Open to relocation (DR & US)",
      es: "Ciudadano estadounidense · Remoto / presencial · Disponible para reubicación (RD y EE. UU.)",
    },
  },
  summary: {
    en: "Security researcher and systems programmer. Vulnerability findings triaged by Riot Games Security. Reports submitted to the U.S. Department of Defense, Agoda, and Neon bug bounty programs. I build open-source security tooling in Rust, from a cryptographic artifact-verification standard to a capability-based microkernel, and publish the research behind it. Bilingual (English/Spanish). US citizen based in the Dominican Republic, available for remote or on-site roles.",
    es: "Investigador de seguridad y programador de sistemas. Hallazgos de vulnerabilidades validados por Riot Games Security. Reportes presentados a los programas de recompensas del Departamento de Defensa de EE. UU., Agoda y Neon. Construyo herramientas de seguridad de código abierto en Rust, desde un estándar de verificación criptográfica de artefactos hasta un microkernel basado en capacidades, y publico la investigación detrás de ellas. Bilingüe (inglés/español). Ciudadano estadounidense radicado en República Dominicana, disponible para roles remotos o presenciales.",
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
        en: "Discovered and coordinated disclosure of a critical (CVSS 8.8) authentication weakness affecting an entire national ISP's subscriber base: GPON credentials derivable from data broadcast in the clear. Withheld the full technical report and used a PGP-signed initial contact when the national CSIRT's published encryption key was found expired, maintaining responsible disclosure standards despite the recipient's own infrastructure gaps.",
        es: "Descubrí y coordiné la divulgación de una debilidad crítica de autenticación (CVSS 8.8) que afecta a toda la base de abonados de un ISP nacional: credenciales GPON derivables de datos transmitidos en claro. Retuve el reporte técnico completo y usé un primer contacto firmado con PGP al encontrar que la clave de cifrado publicada por el CSIRT nacional había expirado, manteniendo estándares de divulgación responsable pese a las brechas de infraestructura del propio receptor.",
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
          en: "Created VWH, a Rust CLI and open standard for cryptographic verification and accountability of digital artifacts. Public key registry, formal format specification.",
          es: "Creé VWH, una CLI en Rust y un estándar abierto para la verificación criptográfica y trazabilidad de artefactos digitales. Registro público de claves, especificación formal de formato.",
        },
        {
          en: "Building Wolfram, a capability-based microkernel in Rust targeting RISC-V. No ambient authority: every resource a program touches is an explicitly granted capability.",
          es: "Desarrollo Wolfram, un microkernel basado en capacidades escrito en Rust para RISC-V. Sin autoridad ambiental: cada recurso que un programa toca es una capacidad otorgada explícitamente.",
        },
        {
          en: "Building Zero, an applied-ML research project training a security reasoning model on CTF problems through adversarial self-play (GRPO), data pipeline included.",
          es: "Desarrollo Zero, un proyecto de investigación en ML aplicado que entrena un modelo de razonamiento de seguridad con problemas CTF mediante self-play adversarial (GRPO), pipeline de datos incluido.",
        },
        {
          en: "Ship and maintain systems tooling: a POSIX shell in Rust (vsh), a Hyprland/Wayland desktop ported to Apple Silicon for Asahi Linux, media-processing CLIs.",
          es: "Publico y mantengo herramientas de sistemas: un shell POSIX en Rust (vsh), un escritorio Hyprland/Wayland portado a Apple Silicon para Asahi Linux, CLIs de procesamiento multimedia.",
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
      items: ["Vulnerability Research", "Reverse Engineering", "Firmware Analysis", "Applied Cryptography", "Coordinated Disclosure"],
    },
    {
      category: { en: "Systems", es: "Sistemas" },
      items: ["Linux", "OS / Kernel Development", "RISC-V", "ARM64", "Wayland", "POSIX"],
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
  ],
}

