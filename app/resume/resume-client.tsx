"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer } from "lucide-react"
import { EASE_OUT_EXPO } from "@/lib/animation"
import { resume, ui, type L, type Lang } from "@/lib/resume"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: EASE_OUT_EXPO },
}

function SectionLabel({ index, label }: { index: number; label: string }) {
  return (
    <p className="break-after-avoid font-mono text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4">
      0{index} — {label}
    </p>
  )
}

export function ResumeClient() {
  // Always render EN first — matches the statically exported HTML, so no
  // hydration mismatch. The #es hash applies post-hydration.
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    if (window.location.hash === "#es") setLang("es")
  }, [])

  const t = (l: L) => l[lang]

  const switchLang = (next: Lang) => {
    setLang(next)
    history.replaceState(null, "", next === "es" ? "#es" : window.location.pathname)
  }

  return (
    <main className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 pt-28 md:pt-36 pb-24 resume-print">
      <article lang={lang}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          className="mb-12 border-b border-white/10 pb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground uppercase">
              06 — {t(ui.resume)}
            </p>

            {/* Controls — hidden in print */}
            <div className="no-print flex items-center gap-4">
              <div className="flex items-center gap-2 font-mono text-[10px] md:text-xs tracking-[0.3em]">
                {(["en", "es"] as const).map((code) => (
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
              <button
                onClick={() => window.print()}
                data-cursor-hover
                aria-label={t(ui.print)}
                className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-full font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors duration-300"
              >
                <Printer className="w-3 h-3" />
                {t(ui.print)}
              </button>
            </div>
          </div>

          <h1 className="font-sans text-4xl md:text-6xl font-light tracking-tight leading-[1.1] mb-3">
            {resume.name}
          </h1>
          <p className="font-sans text-lg md:text-xl font-light italic text-muted-foreground mb-6">
            {t(resume.title)}
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] md:text-xs tracking-wider text-muted-foreground">
            <a href={`mailto:${resume.contact.email}`} data-cursor-hover className="hover:text-foreground transition-colors">
              {resume.contact.email}
            </a>
            <a href={`https://${resume.contact.site}`} data-cursor-hover className="hover:text-foreground transition-colors">
              {resume.contact.site}
            </a>
            <a href={`https://${resume.contact.github}`} target="_blank" rel="noopener noreferrer" data-cursor-hover className="hover:text-foreground transition-colors">
              {resume.contact.github}
            </a>
            {resume.contact.location && <span>{t(resume.contact.location)}</span>}
          </div>
          {resume.contact.availability && (
            <p className="mt-3 font-mono text-[10px] md:text-xs tracking-wider text-accent">
              {t(resume.contact.availability)}
            </p>
          )}
        </motion.header>

        {/* Summary */}
        <motion.section {...fadeIn} className="mb-12">
          <SectionLabel index={1} label={t(ui.summary)} />
          <p className="font-sans text-lg md:text-xl font-light leading-relaxed text-white/90">
            {t(resume.summary)}
          </p>
        </motion.section>

        {/* Experience */}
        <motion.section {...fadeIn} className="mb-12">
          <SectionLabel index={2} label={t(ui.experience)} />
          <div className="space-y-8">
            {resume.experience.map((job) => (
              <div key={job.org + job.period.en} className="border-t border-white/10 pt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <h3 className="font-sans text-xl md:text-2xl font-light tracking-tight">{t(job.role)}</h3>
                  <span className="font-mono text-[10px] md:text-xs tracking-widest text-muted-foreground">{t(job.period)}</span>
                </div>
                <p className="font-mono text-[10px] md:text-xs tracking-wider text-accent mb-4 uppercase">{job.org}</p>
                <ul className="space-y-2">
                  {job.bullets.map((b, i) => (
                    <li key={i} className="break-inside-avoid font-sans text-base font-light leading-relaxed text-muted-foreground pl-4 border-l border-white/10">
                      {t(b)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Skills */}
        <motion.section {...fadeIn} className="mb-12 break-inside-avoid">
          <SectionLabel index={3} label={t(ui.skills)} />
          <div className="space-y-4">
            {resume.skills.map((group) => (
              <div key={group.category.en} className="break-inside-avoid flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                <span className="font-mono text-[10px] md:text-xs tracking-widest text-muted-foreground uppercase sm:w-32 shrink-0">
                  {t(group.category)}
                </span>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-[9px] md:text-[10px] tracking-wider px-2 py-0.5 border border-white/10 rounded-full text-muted-foreground/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Education */}
        <motion.section {...fadeIn} className="mb-12 break-inside-avoid">
          <SectionLabel index={4} label={t(ui.education)} />
          <div className="space-y-4">
            {resume.education.map((entry) => (
              <div key={entry.credential.en} className="break-inside-avoid border-t border-white/10 pt-4 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="font-sans text-lg font-light tracking-tight">{t(entry.credential)}</h3>
                  <p className="font-mono text-[10px] md:text-xs tracking-wider text-muted-foreground mt-1">{entry.org}</p>
                  {entry.detail && (
                    <p className="font-mono text-[10px] md:text-xs tracking-wider text-muted-foreground mt-1">{t(entry.detail)}</p>
                  )}
                </div>
                <span className="font-mono text-[10px] md:text-xs tracking-widest text-muted-foreground">{t(entry.period)}</span>
              </div>
            ))}
          </div>
        </motion.section>
      </article>
    </main>
  )
}
