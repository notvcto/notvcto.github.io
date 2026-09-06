// Run: node lib/currency.check.ts
// Pure resolveCurrency() only — no React, no DOM, no network.
import assert from "node:assert/strict"
import { resolveCurrency } from "./currency.ts"

const cases: [string, string, string][] = [
  // [language, timeZone, expected]
  ["es-DO", "America/Santo_Domingo", "DOP"],
  ["es", "", "EUR"], // maximize() → es-ES
  ["en-US", "", "USD"],
  ["en-US", "America/Santo_Domingo", "DOP"], // TZ beats locale
  ["es-DO", "Europe/Madrid", "EUR"], // …and beats it the other way too
  ["xx-INVALID-!!", "", "USD"], // malformed, must not throw
  ["", "", "USD"],
  ["en-GB", "", "GBP"],
  ["ja-JP", "Asia/Tokyo", "JPY"],
  ["pt-BR", "America/Sao_Paulo", "BRL"],
  ["en-AQ", "", "USD"], // valid region, unmapped currency
  ["fr-FR", "Unknown/Zone", "EUR"], // unmapped TZ falls through to locale
]

for (const [language, timeZone, expected] of cases) {
  const got = resolveCurrency(language, timeZone)
  assert.equal(got, expected, `resolveCurrency(${JSON.stringify(language)}, ${JSON.stringify(timeZone)}) → ${got}, want ${expected}`)
}

console.log(`ok — ${cases.length} cases`)
