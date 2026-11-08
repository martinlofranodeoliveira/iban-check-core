// SPDX-License-Identifier: MIT
// IBAN validation per ISO 13616: electronic format, country length,
// optional BBAN structure, numeric mod-97 check. No network, no I/O.

const DIGITS = '0123456789';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Country code -> { length, bban } where bban is a RegExp over the BBAN part
// (IBAN without the first 4 characters), or null for length+mod97 only.
// Lengths follow the official SWIFT IBAN registry; structures cover the
// most-used countries and are documented in docs/contract.md.
const COUNTRIES = Object.freeze({
  AL: { length: 28, bban: null },
  AD: { length: 24, bban: null },
  AT: { length: 20, bban: /^\d{16}$/ },
  AZ: { length: 28, bban: null },
  BE: { length: 16, bban: /^\d{12}$/ },
  BR: { length: 29, bban: /^\d{23}[A-Z][A-Z0-9]$/ },
  BG: { length: 22, bban: null },
  CH: { length: 21, bban: /^\d{5}[A-Z0-9]{12}$/ },
  CY: { length: 28, bban: null },
  CZ: { length: 24, bban: null },
  DE: { length: 22, bban: /^\d{18}$/ },
  DK: { length: 18, bban: null },
  ES: { length: 24, bban: /^\d{20}$/ },
  FI: { length: 18, bban: null },
  FR: { length: 27, bban: /^\d{10}[A-Z0-9]{11}\d{2}$/ },
  GB: { length: 22, bban: /^[A-Z]{4}\d{14}$/ },
  GI: { length: 23, bban: null },
  GR: { length: 27, bban: null },
  HR: { length: 21, bban: null },
  HU: { length: 28, bban: null },
  IE: { length: 22, bban: /^[A-Z0-9]{4}\d{14}$/ },
  IL: { length: 23, bban: null },
  IS: { length: 26, bban: null },
  IT: { length: 27, bban: /^[A-Z]\d{10}[A-Z0-9]{12}$/ },
  LU: { length: 20, bban: /^\d{3}[A-Z0-9]{13}$/ },
  MT: { length: 31, bban: null },
  NL: { length: 18, bban: /^[A-Z]{4}\d{10}$/ },
  NO: { length: 15, bban: null },
  PL: { length: 28, bban: null },
  PT: { length: 25, bban: /^\d{21}$/ },
  RO: { length: 24, bban: null },
  SE: { length: 24, bban: null },
  SI: { length: 19, bban: null },
  SK: { length: 24, bban: null },
});

export const SUPPORTED_COUNTRIES = Object.freeze(Object.keys(COUNTRIES));

export class IbanError extends Error {
  constructor(code, detail = '') {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'IbanError';
    this.code = code;
  }
}

/** Remove spaces, uppercase. Rejects all other characters implicitly. */
export function normalize(input) {
  if (typeof input !== 'string') throw new IbanError('NOT_STRING');
  const out = input.replace(/[\s-]+/g, '').toUpperCase();
  if (out.length === 0) throw new IbanError('EMPTY');
  if (!/^[A-Z0-9]+$/.test(out)) throw new IbanError('BAD_CHARS');
  return out;
}

/** ISO 13616 rearranged numeric string: move first 4 chars to end, A=10..Z=35. */
export function toNumeric(iban) {
  return expandLetters(iban.slice(4) + iban.slice(0, 4));
}

/** Letter expansion without rotation (input already in rearranged order). */
function expandLetters(s) {
  let out = '';
  for (const ch of s) {
    out += DIGITS.includes(ch) ? ch : String(10 + UPPER.indexOf(ch));
  }
  return out;
}

/** Exact mod-97 over the numeric string in bounded chunks (no precision loss). */
export function mod97(numeric) {
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(BigInt(String(remainder) + numeric.slice(i, i + 7)) % 97n);
  }
  return remainder;
}

/**
 * Validate an IBAN. Returns { iban, country, bban } on success.
 * Throws IbanError with code: NOT_STRING, EMPTY, BAD_CHARS, BAD_COUNTRY,
 * UNSUPPORTED_COUNTRY, BAD_LENGTH, BAD_BBAN, BAD_CHECK.
 */
export function validate(input) {
  const iban = normalize(input);
  if (!/^[A-Z]{2}/.test(iban)) throw new IbanError('BAD_COUNTRY');
  const country = iban.slice(0, 2);
  const spec = COUNTRIES[country];
  if (!spec) {
    if (/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban) && iban.length >= 15 && iban.length <= 34) {
      throw new IbanError('UNSUPPORTED_COUNTRY', country);
    }
    throw new IbanError('BAD_COUNTRY');
  }
  if (iban.length !== spec.length) throw new IbanError('BAD_LENGTH', `expected ${spec.length}, got ${iban.length}`);
  const bban = iban.slice(4);
  if (spec.bban && !spec.bban.test(bban)) throw new IbanError('BAD_BBAN');
  if (mod97(toNumeric(iban)) !== 1) throw new IbanError('BAD_CHECK');
  return { iban, country, bban };
}

/** Non-throwing check. Returns { ok, iban?, country?, code? }. */
export function check(input) {
  try {
    const { iban, country } = validate(input);
    return { ok: true, iban, country };
  } catch (err) {
    if (err instanceof IbanError) return { ok: false, code: err.code };
    throw err;
  }
}

/** Compute the two check digits for a country code + BBAN (both validated). */
export function computeCheckDigits(country, bban) {
  if (!/^[A-Z]{2}$/.test(country)) throw new IbanError('BAD_COUNTRY');
  const clean = String(bban).replace(/[\s-]+/g, '').toUpperCase();
  if (!/^[A-Z0-9]+$/.test(clean)) throw new IbanError('BAD_CHARS');
  const remainder = mod97(expandLetters(clean + country + '00'));
  return String(98 - remainder).padStart(2, '0');
}
