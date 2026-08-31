import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleDraft, validateDraft, reviewDraft} from '../src/domain/forms.mjs';

const kinds = ['enquiry', 'seller', 'review', 'valuation'];

for (const kind of kinds) {
  test(`${kind} accepts fictional defaults only through its field allowlist`, () => {
    const draft = sampleDraft(kind);
    assert.deepEqual(validateDraft(kind, draft), {});
    const rows = reviewDraft(kind, {...draft, secret: 'do not retain'});
    assert.ok(rows.length > 0);
    assert.ok(!JSON.stringify(rows).includes('do not retain'));
  });
}

test('enquiry errors are field-specific and reject missing content', () => {
  const errors = validateDraft('enquiry', {name: '', email: 'bad', message: 'short'});
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'message', 'name']);
});

test('draft values are trimmed and script-like text remains ordinary preview text', () => {
  const draft = sampleDraft('enquiry');
  const rows = reviewDraft('enquiry', {
    ...draft,
    name: '  <script>alert(1)</script>  ',
    ignored: 'discarded',
  });
  assert.equal(rows.find(({label}) => label === 'Name').value, '<script>alert(1)</script>');
  assert.equal(rows.some(({value}) => value === 'discarded'), false);
  assert.deepEqual(validateDraft('enquiry', {...draft, name: '  Al  '}), {});
});

test('every text field enforces its inclusive minimum and maximum after trimming', () => {
  const cases = [
    ['enquiry', 'name', 2, 80], ['enquiry', 'message', 10, 1000],
    ['seller', 'make', 2, 60], ['seller', 'model', 1, 60], ['seller', 'notes', 0, 1000],
    ['review', 'title', 5, 100], ['review', 'review', 20, 1500], ['review', 'author', 2, 80],
    ['valuation', 'make', 2, 60], ['valuation', 'model', 1, 60],
  ];
  for (const [kind, field, min, max] of cases) {
    const base = sampleDraft(kind);
    assert.deepEqual(validateDraft(kind, {...base, [field]: ` ${'x'.repeat(min)} `}), {}, `${kind}.${field} minimum`);
    assert.deepEqual(validateDraft(kind, {...base, [field]: 'x'.repeat(max)}), {}, `${kind}.${field} maximum`);
    if (min > 0) assert.ok(field in validateDraft(kind, {...base, [field]: 'x'.repeat(min - 1)}), `${kind}.${field} below minimum`);
    assert.ok(field in validateDraft(kind, {...base, [field]: 'x'.repeat(max + 1)}), `${kind}.${field} above maximum`);
  }
});

test('email accepts a simple address through 120 characters and rejects invalid values', () => {
  const base = sampleDraft('enquiry');
  const maxEmail = `${'a'.repeat(108)}@example.test`;
  assert.equal(maxEmail.length, 121);
  const validMaxEmail = `${'a'.repeat(107)}@example.test`;
  assert.equal(validMaxEmail.length, 120);
  assert.deepEqual(validateDraft('enquiry', {...base, email: ` ${validMaxEmail} `}), {});
  for (const email of ['missing-domain', 'a@b', maxEmail, 'a b@example.test']) {
    assert.ok('email' in validateDraft('enquiry', {...base, email}), `invalid email ${email}`);
  }
});

test('integer fields reject non-finite, negative, fractional, and out-of-range values', () => {
  const numericFields = [
    ['seller', 'year', 1980, 2027], ['seller', 'mileageKm', 0, 1000000], ['seller', 'askingUsd', 1, 10000000],
    ['review', 'rating', 1, 5], ['valuation', 'year', 1980, 2027], ['valuation', 'mileageKm', 0, 1000000],
  ];
  for (const [kind, field, min, max] of numericFields) {
    const base = sampleDraft(kind);
    for (const value of [String(min), String(max), ` ${min} `]) {
      assert.deepEqual(validateDraft(kind, {...base, [field]: value}), {}, `${kind}.${field} valid ${value}`);
    }
    for (const value of [String(min - 1), String(max + 1), '-1', '1.5', 'Infinity', '-Infinity', 'NaN', '1e3', Infinity, -Infinity, NaN, -1.5]) {
      assert.ok(field in validateDraft(kind, {...base, [field]: value}), `${kind}.${field} invalid ${value}`);
    }
  }
});

test('valuation has only supplied preview fields and never generates an estimate', () => {
  const rows = reviewDraft('valuation', {...sampleDraft('valuation'), estimate: '99999'});
  assert.deepEqual(rows.map(({label}) => label), ['Make', 'Model', 'Year', 'Mileage (km)', 'Condition']);
  assert.equal(JSON.stringify(rows).includes('99999'), false);
});

test('condition must be Excellent, Good, or Fair and unknown kinds are programming errors', () => {
  const base = sampleDraft('valuation');
  for (const condition of ['Excellent', 'Good', 'Fair']) {
    assert.deepEqual(validateDraft('valuation', {...base, condition: ` ${condition} `}), {});
  }
  assert.ok('condition' in validateDraft('valuation', {...base, condition: 'Poor'}));
  assert.throws(() => sampleDraft('unknown'));
  assert.throws(() => validateDraft('unknown', {}));
  assert.throws(() => reviewDraft('unknown', {}));
});
