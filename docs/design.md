# Design — iban-check-core

## Algorithm (ISO 13616)

1. Normalize to electronic format (remove spaces/hyphens, uppercase).
2. Country code must be in the fixed table; length must match exactly.
3. Optional BBAN structure check (regex) for 12 documented countries.
4. Rearrange (first 4 to end), expand letters (A=10..Z=35), exact mod-97
   in 7-digit chunks; valid iff remainder is 1.

Check-digit computation applies step 4 to `BBAN + country + '00'` and
returns `98 - remainder`, zero-padded: the standard generation rule.

## Oracle

Tests assert official registry examples (DE, GB, FR, ES, IT, NL, BE, CH,
PT, AT, IE) plus round-trips: every recomputed check digit must validate.
Negative cases pin each error code, so a regression cannot silently widen
acceptance.

## Non-goals

No BBAN semantics (bank/branch decoding), no registry updates at runtime,
no checksum repair. Adding a country means one table row plus tests.
