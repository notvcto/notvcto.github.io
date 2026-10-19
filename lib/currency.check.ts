// Run: node lib/currency.check.ts
// Pure resolveCurrency() only — no React, no DOM, no network.
import assert from "node:assert/strict"
import { isValidRates, parseRatesCache, resolveCurrency } from "./currency.ts"

const cases: [string, string, string][] = [
  // [language, timeZone, expected]
  ["es-DO", "America/Santo_Domingo", "DOP"],
  ["bg-BG", "Europe/Sofia", "EUR"],
  ["nl-CW", "America/Curacao", "XCG"],
  ["en-SX", "", "XCG"],
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

for (const rates of [null, [], {}, { EUR: 0 }, { EUR: -1 }, { EUR: NaN }, { EUR: Infinity }, { EUR: "1" }]) {
  assert.equal(isValidRates(rates), false)
}
const validRates = { USD: 1, EUR: 0.9, XCG: 1.79 }
assert.equal(isValidRates(validRates), true)
assert.deepEqual(parseRatesCache({ rates: validRates, expires: 101 }, 100), { rates: validRates, expires: 101 })
for (const value of [null, {}, { rates: validRates, expires: 100 }, { rates: validRates, expires: Infinity }, { rates: { EUR: -1 }, expires: 101 }]) {
  assert.equal(parseRatesCache(value, 100), null)
}
console.log("ok — rate validation and expiration boundaries")
