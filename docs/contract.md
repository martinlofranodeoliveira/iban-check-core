# Contract — iban-check-core

Pure ESM module in `src/iban.mjs`, zero runtime dependencies. Works on Node >= 22.
No network, storage, clock or locale use. All functions are synchronous and
never mutate their inputs. Error messages never echo user input beyond the
fixed code plus a short non-sensitive detail.

## API

```js
import { validate, check, normalize, computeCheckDigits, SUPPORTED_COUNTRIES } from './src/iban.mjs';
```

| Export | Result |
| --- | --- |
| `SUPPORTED_COUNTRIES` | Frozen list of 32 supported country codes. |
| `normalize(input)` | Electronic format: strips spaces/hyphens, uppercases. Throws `NOT_STRING`, `EMPTY`, `BAD_CHARS`. |
| `toNumeric(iban)` | Rearranged numeric string (first 4 moved to end, A=10..Z=35). |
| `mod97(numeric)` | Exact remainder, chunked (no precision loss). |
| `validate(input)` | `{ iban, country, bban }` or throws `IbanError` with `code`. |
| `check(input)` | `{ ok: true, iban, country }` or `{ ok: false, code }`. Never throws `IbanError`. |
| `computeCheckDigits(country, bban)` | Two digits, e.g. `computeCheckDigits('DE','370400440532013000') === '89'`. |

## Error codes

`NOT_STRING` · `EMPTY` · `BAD_CHARS` · `BAD_COUNTRY` · `UNSUPPORTED_COUNTRY` ·
`BAD_LENGTH` · `BAD_BBAN` · `BAD_CHECK`

`UNSUPPORTED_COUNTRY` means the shape is IBAN-plausible (15–34 chars) but the
country is outside the supported table — an explicit honesty boundary, not a
guess. `BAD_BBAN` is only raised for countries with a documented structure;
the rest are length + mod-97.

## Bounds

At most 34 input characters; country table is fixed (32 entries). No
truncation, no repair: invalid input is reported, never corrected.
