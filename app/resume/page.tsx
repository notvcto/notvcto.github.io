import type { Metadata } from "next"
import { ResumeClient } from "./resume-client"

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume / CV of Victor Soto — Security Researcher & Systems Programmer. Available in English and Spanish.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "Resume | NOTVCTO",
    description:
      "Resume / CV of Victor Soto — Security Researcher & Systems Programmer. Available in English and Spanish.",
    images: ["/og/portfolio.png"],
  },
}

export default function ResumePage() {
  return <ResumeClient />
}
