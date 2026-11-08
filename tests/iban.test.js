import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validate, check, normalize, computeCheckDigits, SUPPORTED_COUNTRIES, IbanError } from '../src/iban.mjs';

const VALID = [
  'DE89370400440532013000',
  'GB29NWBK60161331926819',
  'FR1420041010050500013M02606',
  'ES9121000418450200051332',
  'IT60X0542811101000000123456',
  'NL91ABNA0417164300',
  'BE68539007547034',
  'CH9300762011623852957',
  'PT50000201231234567890154',
  'AT611904300234573201',
  'IE29AIBK93115212345678',
];

describe('valid IBANs', () => {
  for (const iban of VALID) {
    it(`accepts ${iban.slice(0, 2)} example`, () => {
      const r = validate(iban);
      assert.equal(r.country, iban.slice(0, 2));
      assert.equal(r.iban, iban);
    });
  }
  it('accepts spaces, hyphens and lowercase', () => {
    assert.equal(check('de89 3704-0044 0532 0130 00').ok, true);
  });
});

describe('invalid IBANs', () => {
  it('rejects wrong check digits', () => {
    assert.equal(check('DE88370400440532013000').code, 'BAD_CHECK');
    assert.equal(check('GB29NWBK60161331926818').code, 'BAD_CHECK');
  });
  it('rejects bad length', () => {
    assert.equal(check('DE8937040044053201300').code, 'BAD_LENGTH');
    assert.equal(check('DE893704004405320130001').code, 'BAD_LENGTH');
  });
  it('rejects bad BBAN structure', () => {
    assert.equal(check('DE89AAAAAAAAAAAAAAAAAA').code, 'BAD_BBAN');
  });
  it('rejects bad characters and empty', () => {
    assert.equal(check('DE89!70400440532013000').code, 'BAD_CHARS');
    assert.equal(check('   ').code, 'EMPTY');
  });
  it('rejects unknown country shape vs unsupported registry country', () => {
    assert.equal(check('1X89370400440532013000').code, 'BAD_COUNTRY');
    // US-length-plausible but not in table
    assert.equal(check('US0012345678901234567890').code, 'UNSUPPORTED_COUNTRY');
  });
  it('throws IbanError with code, not plain Error', () => {
    assert.throws(() => validate('DE00'), (e) => e instanceof IbanError && typeof e.code === 'string');
  });
});

describe('check digits', () => {
  it('recomputes DE check digits', () => {
    assert.equal(computeCheckDigits('DE', '370400440532013000'), '89');
  });
  it('recomputed IBAN validates', () => {
    const cc = computeCheckDigits('NL', 'ABNA0417164300');
    assert.equal(validate(`NL${cc}ABNA0417164300`).iban, `NL${cc}ABNA0417164300`);
  });
});

describe('scope', () => {
  it('supports at least 25 countries', () => {
    assert.ok(SUPPORTED_COUNTRIES.length >= 25);
  });
  it('normalize is strict about types', () => {
    assert.throws(() => normalize(42), (e) => e.code === 'NOT_STRING');
  });
});
