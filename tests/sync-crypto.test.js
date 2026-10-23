const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { webcrypto, hkdfSync } = require('node:crypto');
const Crypto = require('../syncCrypto.js');

const CODE = 'DE1-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA-AAAA';
const scope = 'DailyEnglishSync:v1';
const b64url = (value) => Buffer.from(value).toString('base64url');
const errorCode = (expected) => (error) => error.code === expected;

test('pairing codes use twenty secure random bytes and canonical eight-group base32 formatting', () => {
  const codes = new Set(Array.from({ length: 128 }, () => Crypto.generateCode()));
  assert.equal(codes.size, 128);
  for (const code of codes) assert.match(code, /^DE1(?:-[A-Z2-7]{4}){8}$/);
  const calls = [];
  const context = { window: {}, TextEncoder, TextDecoder, crypto: { subtle: webcrypto.subtle, getRandomValues(bytes) { calls.push(bytes.length); bytes.fill(255); return bytes; } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../syncCrypto.js'), 'utf8'), context);
  assert.equal(context.window.DailyEnglishSyncCrypto.generateCode(), 'DE1-7777-7777-7777-7777-7777-7777-7777-7777');
  assert.deepEqual(calls, [20]);
});

test('formatting tolerates case, whitespace and separators without accepting ambiguous or shortened digits', () => {
  assert.equal(Crypto.normalizeCode(' de1 aaaa-aaaa aaaa\naaaa\taaaa-aaaa-aaaa-aaaa '), CODE);
  assert.equal(Crypto.normalizeCode('DE1' + 'A'.repeat(32)), CODE);
  for (const wrong of ['', null, 123, 'DE2' + 'A'.repeat(32), 'DE1' + 'A'.repeat(31), 'DE1' + 'A'.repeat(33),
    ...['0', '1', '8', '9', '=', '_', 'Ａ', '—'].map((character) => 'DE1' + 'A'.repeat(31) + character)]) {
    assert.throws(() => Crypto.normalizeCode(wrong), errorCode('INVALID_CODE'));
  }
});

test('HKDF room/auth derivation matches an independent standard implementation and separates purposes', async () => {
  const keys = await Crypto.derive(CODE);
  const expectedRoom = Buffer.from(hkdfSync('sha256', Buffer.alloc(20), Buffer.from(scope), Buffer.from(`${scope}:room-id`), 32));
  const expectedAuth = Buffer.from(hkdfSync('sha256', Buffer.alloc(20), Buffer.from(scope), Buffer.from(`${scope}:authentication-secret`), 32));
  const expectedEncryption = Buffer.from(hkdfSync('sha256', Buffer.alloc(20), Buffer.from(scope), Buffer.from(`${scope}:encryption-key`), 32));
  assert.equal(keys.room, expectedRoom.toString('hex')); assert.equal(keys.auth, expectedAuth.toString('base64url'));
  assert.match(keys.room, /^[0-9a-f]{64}$/); assert.match(keys.auth, /^[A-Za-z0-9_-]{43}$/);
  assert.notDeepEqual(expectedRoom, expectedAuth); assert.notDeepEqual(expectedEncryption, expectedAuth);
  assert.equal(keys.key.extractable, false); assert.equal(keys.key.algorithm.name, 'AES-GCM'); assert.equal(keys.key.algorithm.length, 256);
  await assert.rejects(webcrypto.subtle.exportKey('raw', keys.key));
  const repeated = await Crypto.derive(CODE.toLowerCase());
  assert.equal(repeated.room, keys.room); assert.equal(repeated.auth, keys.auth);
});

test('encryption round-trips Unicode progress and uses a fresh IV for identical payloads', async () => {
  const keys = await Crypto.derive(CODE), payload = { version: 1, text: '我的学习记录🙂', records: [{ writing: 'I have learned this.', correct: true }], nullable: null };
  const original = structuredClone(payload), one = await Crypto.encrypt(payload, keys), two = await Crypto.encrypt(payload, keys);
  assert.deepEqual(Object.keys(one).sort(), ['ciphertext', 'iv', 'version']); assert.match(one.iv, /^[A-Za-z0-9_-]{16}$/);
  assert.notEqual(one.iv, two.iv); assert.notEqual(one.ciphertext, two.ciphertext);
  assert.deepEqual(await Crypto.decrypt(one, await Crypto.derive(CODE)), payload);
  assert.deepEqual(await Crypto.decrypt(two, keys), payload); assert.deepEqual(payload, original);
  assert.ok(!JSON.stringify(one).includes(keys.auth)); assert.ok(!JSON.stringify(one).includes('我的学习记录'));
});

test('wrong pairing secret, modified ciphertext, changed IV and room substitution all fail authentication', async () => {
  const keys = await Crypto.derive(CODE), document = await Crypto.encrypt({ text: 'Keep this private' }, keys);
  const other = await Crypto.derive('DE1-' + Array(8).fill('BBBB').join('-'));
  await assert.rejects(Crypto.decrypt(document, other), errorCode('AUTHENTICATION_FAILED'));
  const tampered = { ...document, ciphertext: (document.ciphertext[0] === 'A' ? 'B' : 'A') + document.ciphertext.slice(1) };
  await assert.rejects(Crypto.decrypt(tampered, keys), errorCode('AUTHENTICATION_FAILED'));
  const changedIV = { ...document, iv: (document.iv[0] === 'A' ? 'B' : 'A') + document.iv.slice(1) };
  await assert.rejects(Crypto.decrypt(changedIV, keys), errorCode('AUTHENTICATION_FAILED'));
  await assert.rejects(Crypto.decrypt(document, { ...keys, room: 'f'.repeat(64) }), errorCode('AUTHENTICATION_FAILED'));
});

test('encryption interoperates with a separate AES-GCM operation using the documented AAD', async () => {
  const keys = await Crypto.derive(CODE), document = await Crypto.encrypt({ ok: true }, keys);
  const rawKey = hkdfSync('sha256', Buffer.alloc(20), Buffer.from(scope), Buffer.from(`${scope}:encryption-key`), 32);
  const independentKey = await webcrypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']);
  const result = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(document.iv, 'base64url'), additionalData: Buffer.from(`${scope}:document:1:${keys.room}`), tagLength: 128 }, independentKey, Buffer.from(document.ciphertext, 'base64url'));
  assert.deepEqual(JSON.parse(Buffer.from(result).toString()), { ok: true });
});

test('malformed document fields, unsupported versions and noncanonical base64 are rejected', async () => {
  const keys = await Crypto.derive(CODE), document = await Crypto.encrypt({ ok: true }, keys);
  for (const wrong of [null, [], {}, { ...document, version: 2 }, { ...document, extra: 'unexpected' }, { ...document, iv: 'short' },
    { ...document, ciphertext: 'A'.repeat(25) }, { ...document, ciphertext: document.ciphertext + '=' }, { ...document, iv: '.'.repeat(16) }]) {
    await assert.rejects(Crypto.decrypt(wrong, keys), errorCode('INVALID_DOCUMENT'));
  }
  const noncanonical = b64url(new Uint8Array(16));
  await assert.rejects(Crypto.decrypt({ version: 1, iv: document.iv, ciphertext: noncanonical.slice(0, -1) + 'B' }, keys), errorCode('INVALID_DOCUMENT'));
});

test('plain JSON constraints reject silent data loss, unsafe fields and cycles', async () => {
  const keys = await Crypto.derive(CODE), cyclic = {}; cyclic.self = cyclic;
  for (const wrong of [[], null, { missing: undefined }, { notANumber: NaN }, { amount: BigInt(1) }, { when: new Date() }, { callback() {} }, cyclic, JSON.parse('{"__proto__":{"polluted":true}}')]) {
    await assert.rejects(Crypto.encrypt(wrong, keys), errorCode('INVALID_DATA'));
  }
  assert.equal({}.polluted, undefined);
});

test('an authenticated malformed JSON payload cannot bypass decrypted-data validation', async () => {
  const keys = await Crypto.derive(CODE), iv = webcrypto.getRandomValues(new Uint8Array(12));
  for (const raw of ['invalid JSON', '[]', '{"__proto__":{"polluted":true}}']) {
    const ciphertext = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: Buffer.from(`${scope}:document:1:${keys.room}`), tagLength: 128 }, keys.key, Buffer.from(raw));
    await assert.rejects(Crypto.decrypt({ version: 1, iv: b64url(iv), ciphertext: b64url(ciphertext) }, keys), errorCode('INVALID_DATA'));
  }
});

test('UTF-8 byte limits and encrypted transport bounds reject oversized records without truncation', async () => {
  const keys = await Crypto.derive(CODE), oversized = { writing: '学'.repeat(Math.ceil(Crypto.MAX_PLAINTEXT_BYTES / 3)) };
  await assert.rejects(Crypto.encrypt(oversized, keys), errorCode('SIZE_LIMIT'));
  await assert.rejects(Crypto.encrypt({ writing: 'x'.repeat(Crypto.MAX_PLAINTEXT_BYTES) }, keys), errorCode('SIZE_LIMIT'));
  await assert.rejects(Crypto.decrypt({ version: 1, iv: 'A'.repeat(16), ciphertext: 'A'.repeat(Crypto.MAX_CIPHERTEXT_CHARS + 1) }, keys), errorCode('SIZE_LIMIT'));
  assert.ok(Crypto.MAX_CIPHERTEXT_CHARS + 100 < 8 * 1024 * 1024);
  assert.equal(oversized.writing.length, Math.ceil(Crypto.MAX_PLAINTEXT_BYTES / 3));
});

test('Node fallback works without a global crypto object and browser module exposes its UMD API', async () => {
  const context = { module: { exports: {} }, require, TextEncoder, TextDecoder, Buffer };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../syncCrypto.js'), 'utf8'), context);
  assert.match(context.module.exports.generateCode(), /^DE1(?:-[A-Z2-7]{4}){8}$/);
  const keys = await context.module.exports.derive(CODE);
  assert.match(keys.room, /^[0-9a-f]{64}$/);
});

test('browser-only base64 path encrypts and decrypts without Node Buffer or require', async () => {
  const context = { window: {}, TextEncoder, TextDecoder, crypto: webcrypto, btoa, atob };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../syncCrypto.js'), 'utf8'), context);
  const result = await vm.runInNewContext(`(async () => {
    const api = window.DailyEnglishSyncCrypto;
    const keys = await api.derive('${CODE}');
    const encrypted = await api.encrypt({ writing: '网页学习记录', answers: [1, null, 2] }, keys);
    return await api.decrypt(encrypted, keys);
  })()`, context);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { writing: '网页学习记录', answers: [1, null, 2] });
});

test('all 160 random secret bits survive base32 formatting and HKDF decoding', async () => {
  const bytes = Uint8Array.from({ length: 20 }, (_, index) => index * 13 % 256);
  const context = { window: {}, TextEncoder, TextDecoder, crypto: { subtle: webcrypto.subtle, getRandomValues(target) { target.set(bytes); return target; } }, btoa, atob };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../syncCrypto.js'), 'utf8'), context);
  const api = context.window.DailyEnglishSyncCrypto, code = api.generateCode();
  const bits = Array.from(bytes, (byte) => byte.toString(2).padStart(8, '0')).join('');
  const encoded = bits.match(/.{5}/g).map((group) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[parseInt(group, 2)]).join('');
  assert.equal(code.replace(/-/g, '').slice(3), encoded);
  const keys = await api.derive(code);
  assert.equal(keys.room, Buffer.from(hkdfSync('sha256', bytes, Buffer.from(scope), Buffer.from(`${scope}:room-id`), 32)).toString('hex'));
});
