"use client"

import { useEffect, useState } from "react"

// Region → currency, stored inverted (one line per currency) so the table stays
// readable. Flattened into a Map at module load.
const CURRENCY_REGIONS: Record<string, string> = {
  EUR: "AD AT AX BE BL CY DE EE ES FI FR GF GP GR HR IE IT LT LU LV MC ME MF MQ MT NL PM PT RE SI SK SM VA XK YT",
  USD: "US AS BQ EC FM GU IO MH MP PR PW SV TC TL UM VG VI ZW",
  GBP: "GB GG IM JE",
  DOP: "DO",
  MXN: "MX",
  CAD: "CA",
  JPY: "JP",
  CNY: "CN",
  INR: "IN",
  BRL: "BR",
  AUD: "AU CC CX HM KI NF NR TV",
  NZD: "NZ CK NU PN TK",
  CHF: "CH LI",
  SEK: "SE",
  NOK: "NO BV SJ",
  DKK: "DK FO GL",
  PLN: "PL",
  CZK: "CZ",
  HUF: "HU",
  RON: "RO",
  BGN: "BG",
  ISK: "IS",
  TRY: "TR",
  RUB: "RU",
  UAH: "UA",
  ARS: "AR",
  CLP: "CL",
  COP: "CO",
  PEN: "PE",
  UYU: "UY",
  BOB: "BO",
  PYG: "PY",
  VES: "VE",
  CRC: "CR",
  GTQ: "GT",
  HNL: "HN",
  NIO: "NI",
  PAB: "PA",
  CUP: "CU",
  JMD: "JM",
  TTD: "TT",
  BBD: "BB",
  BSD: "BS",
  BZD: "BZ",
  HTG: "HT",
  XCD: "AG AI DM GD KN LC MS VC",
  AWG: "AW",
  ANG: "CW SX",
  KYD: "KY",
  BMD: "BM",
  GYD: "GY",
  SRD: "SR",
  KRW: "KR",
  TWD: "TW",
  HKD: "HK",
  MOP: "MO",
  SGD: "SG",
  MYR: "MY",
  THB: "TH",
  IDR: "ID",
  PHP: "PH",
  VND: "VN",
  KHR: "KH",
  LAK: "LA",
  MMK: "MM",
  BDT: "BD",
  PKR: "PK",
  LKR: "LK",
  NPR: "NP",
  BTN: "BT",
  MVR: "MV",
  AFN: "AF",
  IRR: "IR",
  IQD: "IQ",
  ILS: "IL PS",
  JOD: "JO",
  LBP: "LB",
  SYP: "SY",
  SAR: "SA",
  AED: "AE",
  QAR: "QA",
  KWD: "KW",
  BHD: "BH",
  OMR: "OM",
  YER: "YE",
  EGP: "EG",
  MAD: "MA EH",
  DZD: "DZ",
  TND: "TN",
  LYD: "LY",
  SDG: "SD",
  ETB: "ET",
  KES: "KE",
  TZS: "TZ",
  UGX: "UG",
  RWF: "RW",
  NGN: "NG",
  GHS: "GH",
  XOF: "BF BJ CI GW ML NE SN TG",
  XAF: "CF CG CM GA GQ TD",
  ZAR: "ZA LS NA SZ",
  BWP: "BW",
  MZN: "MZ",
  ZMW: "ZM",
  MWK: "MW",
  AOA: "AO",
  CDF: "CD",
  MGA: "MG",
  MUR: "MU",
  SCR: "SC",
  KZT: "KZ",
  UZS: "UZ",
  AZN: "AZ",
  GEL: "GE",
  AMD: "AM",
  BYN: "BY",
  MDL: "MD",
  RSD: "RS",
  MKD: "MK",
  ALL: "AL",
  BAM: "BA",
  FJD: "FJ",
  PGK: "PG",
  WST: "WS",
  TOP: "TO",
  VUV: "VU",
  SBD: "SB",
  XPF: "NC PF WF",
  MNT: "MN",
}

// ponytail: partial IANA zone list; unmapped zones fall through to the locale's
// region, which is the right answer for everyone not travelling. Add zones if
// visitors from somewhere unmapped actually show up.
const TZ_REGIONS: Record<string, string> = {
  DO: "America/Santo_Domingo",
  US: "America/New_York America/Chicago America/Denver America/Phoenix America/Los_Angeles America/Anchorage Pacific/Honolulu America/Detroit America/Indiana/Indianapolis",
  CA: "America/Toronto America/Vancouver America/Edmonton America/Winnipeg America/Halifax America/St_Johns",
  MX: "America/Mexico_City America/Tijuana America/Monterrey America/Cancun",
  PR: "America/Puerto_Rico",
  CU: "America/Havana",
  JM: "America/Jamaica",
  HT: "America/Port-au-Prince",
  BS: "America/Nassau",
  BB: "America/Barbados",
  TT: "America/Port_of_Spain",
  AW: "America/Aruba",
  CW: "America/Curacao",
  KY: "America/Cayman",
  BR: "America/Sao_Paulo America/Bahia America/Fortaleza America/Manaus America/Recife",
  AR: "America/Argentina/Buenos_Aires America/Argentina/Cordoba",
  CL: "America/Santiago",
  CO: "America/Bogota",
  PE: "America/Lima",
  PA: "America/Panama",
  VE: "America/Caracas",
  EC: "America/Guayaquil",
  BO: "America/La_Paz",
  PY: "America/Asuncion",
  UY: "America/Montevideo",
  CR: "America/Costa_Rica",
  GT: "America/Guatemala",
  HN: "America/Tegucigalpa",
  NI: "America/Managua",
  SV: "America/El_Salvador",
  BZ: "America/Belize",
  GB: "Europe/London",
  IE: "Europe/Dublin",
  PT: "Europe/Lisbon Atlantic/Azores",
  ES: "Europe/Madrid Atlantic/Canary",
  FR: "Europe/Paris",
  DE: "Europe/Berlin",
  IT: "Europe/Rome",
  NL: "Europe/Amsterdam",
  BE: "Europe/Brussels",
  AT: "Europe/Vienna",
  CH: "Europe/Zurich",
  SE: "Europe/Stockholm",
  NO: "Europe/Oslo",
  DK: "Europe/Copenhagen",
  FI: "Europe/Helsinki",
  IS: "Atlantic/Reykjavik",
  PL: "Europe/Warsaw",
  CZ: "Europe/Prague",
  HU: "Europe/Budapest",
  RO: "Europe/Bucharest",
  BG: "Europe/Sofia",
  GR: "Europe/Athens",
  HR: "Europe/Zagreb",
  SI: "Europe/Ljubljana",
  SK: "Europe/Bratislava",
  RS: "Europe/Belgrade",
  UA: "Europe/Kyiv Europe/Kiev",
  RU: "Europe/Moscow Asia/Yekaterinburg Asia/Novosibirsk Asia/Vladivostok",
  TR: "Europe/Istanbul",
  IL: "Asia/Jerusalem",
  AE: "Asia/Dubai",
  SA: "Asia/Riyadh",
  QA: "Asia/Qatar",
  KW: "Asia/Kuwait",
  EG: "Africa/Cairo",
  MA: "Africa/Casablanca",
  NG: "Africa/Lagos",
  KE: "Africa/Nairobi",
  ZA: "Africa/Johannesburg",
  GH: "Africa/Accra",
  ET: "Africa/Addis_Ababa",
  IN: "Asia/Kolkata Asia/Calcutta",
  PK: "Asia/Karachi",
  BD: "Asia/Dhaka",
  LK: "Asia/Colombo",
  NP: "Asia/Kathmandu",
  CN: "Asia/Shanghai Asia/Chongqing Asia/Urumqi",
  HK: "Asia/Hong_Kong",
  TW: "Asia/Taipei",
  JP: "Asia/Tokyo",
  KR: "Asia/Seoul",
  SG: "Asia/Singapore",
  MY: "Asia/Kuala_Lumpur",
  TH: "Asia/Bangkok",
  ID: "Asia/Jakarta Asia/Makassar",
  PH: "Asia/Manila",
  VN: "Asia/Ho_Chi_Minh Asia/Saigon",
  AU: "Australia/Sydney Australia/Melbourne Australia/Brisbane Australia/Perth Australia/Adelaide Australia/Darwin Australia/Hobart",
  NZ: "Pacific/Auckland",
  FJ: "Pacific/Fiji",
  KZ: "Asia/Almaty",
  UZ: "Asia/Tashkent",
  TM: "Asia/Ashgabat",
  KG: "Asia/Bishkek",
  TJ: "Asia/Dushanbe",
  AF: "Asia/Kabul",
  IR: "Asia/Tehran",
  IQ: "Asia/Baghdad",
  JO: "Asia/Amman",
  LB: "Asia/Beirut",
  SY: "Asia/Damascus",
  YE: "Asia/Aden",
  OM: "Asia/Muscat",
  BH: "Asia/Bahrain",
  MM: "Asia/Yangon",
  KH: "Asia/Phnom_Penh",
  LA: "Asia/Vientiane",
  MN: "Asia/Ulaanbaatar",
  KP: "Asia/Pyongyang",
  BT: "Asia/Thimphu",
  MV: "Indian/Maldives",
  DZ: "Africa/Algiers",
  TN: "Africa/Tunis",
  LY: "Africa/Tripoli",
  SD: "Africa/Khartoum",
  TZ: "Africa/Dar_es_Salaam",
  UG: "Africa/Kampala",
  RW: "Africa/Kigali",
  ZM: "Africa/Lusaka",
  ZW: "Africa/Harare",
  BW: "Africa/Gaborone",
  NA: "Africa/Windhoek",
  AO: "Africa/Luanda",
  MZ: "Africa/Maputo",
  MG: "Indian/Antananarivo",
  MU: "Indian/Mauritius",
  SC: "Indian/Mahe",
  SN: "Africa/Dakar",
  CI: "Africa/Abidjan",
  CM: "Africa/Douala",
  CD: "Africa/Kinshasa Africa/Lubumbashi",
  CG: "Africa/Brazzaville",
  GA: "Africa/Libreville",
  GQ: "Africa/Malabo",
  TD: "Africa/Ndjamena",
  CF: "Africa/Bangui",
  BJ: "Africa/Porto-Novo",
  TG: "Africa/Lome",
  BF: "Africa/Ouagadougou",
  ML: "Africa/Bamako",
  NE: "Africa/Niamey",
  MR: "Africa/Nouakchott",
  GM: "Africa/Banjul",
  GN: "Africa/Conakry",
  SL: "Africa/Freetown",
  LR: "Africa/Monrovia",
}

const invert = (table: Record<string, string>) =>
  new Map(Object.entries(table).flatMap(([value, keys]) => keys.split(" ").map((k) => [k, value] as const)))

const REGION_CURRENCY = invert(CURRENCY_REGIONS)
const ZONE_REGION = invert(TZ_REGIONS)

/**
 * Pure: which currency should a visitor with this browser language and timezone
 * see? Timezone wins when we have a mapping for it — an en-US browser sitting in
 * America/Santo_Domingo is someone in the DR. Falls back to USD, never throws.
 */
export function resolveCurrency(language: string, timeZone: string): string {
  let region = ZONE_REGION.get(timeZone)
  if (!region) {
    try {
      region = new Intl.Locale(language).maximize().region
    } catch {
      // malformed navigator.language — RangeError. Fall through to USD.
    }
  }
  return (region && REGION_CURRENCY.get(region)) || "USD"
}

type Rates = Record<string, number>

const CACHE_KEY = "rates:USD"
const API = "https://open.er-api.com/v6/latest/USD"

// Shared across hook instances so navigating list ↔ detail doesn't refetch, and
// two mounted components share one request.
let cached: Rates | null = null
let inflight: Promise<Rates | null> | null = null

function readCache(): Rates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { rates, expires } = JSON.parse(raw)
    return Date.now() < expires ? rates : null
  } catch {
    // Safari private mode throws on localStorage; bad JSON throws too.
    return null
  }
}

async function fetchRates(): Promise<Rates | null> {
  try {
    const res = await fetch(API)
    const data = await res.json()
    if (data.result !== "success" || !data.rates) return null
    const expires = (data.time_next_update_unix ?? 0) * 1000 || Date.now() + 12 * 3600_000
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, expires }))
    } catch {
      // Storage full or blocked — the in-memory copy still works this session.
    }
    return data.rates
  } catch {
    return null
  }
}

/**
 * Returns a price formatter. Renders the authored USD figure alone until live
 * rates land — which is also the offline and fetch-failed behavior, so there's
 * one code path and no error state. USD visitors never trigger a request.
 * Supports both single prices and {min, max} ranges.
 */
export function useLocalPrice() {
  const [local, setLocal] = useState<{ currency: string; rate: number } | null>(null)

  useEffect(() => {
    const currency = resolveCurrency(navigator.language, Intl.DateTimeFormat().resolvedOptions().timeZone)
    if (currency === "USD") return

    const apply = (rates: Rates | null) => {
      const rate = rates?.[currency]
      if (rate) setLocal({ currency, rate })
    }

    const hit = cached ?? readCache()
    if (hit) {
      cached = hit
      apply(hit)
      return
    }

    inflight ??= fetchRates().then((r) => {
      cached = r
      inflight = null
      return r
    })
    inflight.then(apply)
  }, [])

  return (price: number | { min: number; max: number }) => {
    const nf = (currency: string, value: number) =>
      new Intl.NumberFormat(navigator.language, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value)

    // Handle price ranges
    if (typeof price === "object") {
      if (!local) {
        return `$${price.min}–$${price.max}`
      }
      const minConverted = nf(local.currency, price.min * local.rate)
      const maxConverted = nf(local.currency, price.max * local.rate)
      return `${minConverted}–${maxConverted} · $${price.min}–$${price.max} USD`
    }

    // Handle single price
    if (!local) return `$${price}`
    return `${nf(local.currency, price * local.rate)} · $${price} USD`
  }
}
