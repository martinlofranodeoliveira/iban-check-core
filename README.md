# iban-check-core

Offline IBAN validation (ISO 13616): electronic format, country length,
BBAN structure and mod-97 check. Zero runtime dependencies, Node >= 22.

Part of the LOFRANO TECNOLOGIA open-source lab. MIT.

## Use

```js
import { validate, check } from './src/iban.mjs';

validate('DE89370400440532013000');
// { iban: 'DE89370400440532013000', country: 'DE', bban: '370400440532013000' }

check('DE88370400440532013000');
// { ok: false, code: 'BAD_CHECK' }
```

32 supported countries (see `docs/contract.md`). Anything outside the table
fails with an explicit `UNSUPPORTED_COUNTRY` instead of a guess.

## Test and demo

```sh
npm test          # 22 tests, node:test, no dependencies
npm run demo      # fixed list, asserts expectations
```

## Limits

No bank/branch decoding, no registry updates at runtime, no checksum repair.
Invalid input is reported, never corrected.

## License

MIT — see `LICENSE`.
