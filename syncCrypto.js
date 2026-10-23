(function (root) {
  'use strict';

  const VERSION = 1;
  const NAMESPACE = 'DailyEnglishSync:v1';
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  // Leave room for the GCM tag, base64 expansion and transport JSON below 8 MiB.
  const MAX_PLAINTEXT_BYTES = 6 * 1024 * 1024 - 4096;
  const MAX_CIPHERTEXT_CHARS = Math.ceil((MAX_PLAINTEXT_BYTES + 16) * 4 / 3);
  const encoder = new TextEncoder();
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  function fail(code, message) { const error = new Error(message); error.code = code; throw error; }
  function cryptoAPI() {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle && typeof globalThis.crypto.getRandomValues === 'function') return globalThis.crypto;
    if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
      const crypto = require('node:crypto').webcrypto;
      if (crypto?.subtle) return crypto;
    }
    return fail('UNSUPPORTED_CRYPTO', '当前浏览器不支持安全同步，请使用支持 HTTPS 加密的较新浏览器。');
  }
  function encodeBase32(bytes) {
    let value = 0, bits = 0, encoded = '';
    for (const byte of bytes) {
      value = (value << 8) | byte; bits += 8;
      while (bits >= 5) { bits -= 5; encoded += ALPHABET[(value >>> bits) & 31]; }
      value &= (1 << bits) - 1;
    }
    if (bits) encoded += ALPHABET[(value << (5 - bits)) & 31];
    return encoded;
  }
  function normalizeCode(code) {
    if (typeof code !== 'string' || code.length > 256 || /[^A-Za-z0-9\s-]/u.test(code)) fail('INVALID_CODE', '同步码格式不正确，请完整复制以 DE1 开头的同步码。');
    const compact = code.replace(/[\s-]/gu, '').toUpperCase();
    if (!/^DE1[A-Z2-7]{32}$/.test(compact)) fail('INVALID_CODE', '同步码应包含 DE1 和 32 位英文字母或数字 2–7，请检查是否漏写或输错。');
    return 'DE1-' + compact.slice(3).match(/.{4}/g).join('-');
  }
  function decodeCode(code) {
    const encoded = normalizeCode(code).replace(/-/g, '').slice(3), bytes = new Uint8Array(20);
    let value = 0, bits = 0, offset = 0;
    for (const character of encoded) {
      value = (value << 5) | ALPHABET.indexOf(character); bits += 5;
      if (bits >= 8) { bits -= 8; bytes[offset++] = (value >>> bits) & 255; }
      value &= (1 << bits) - 1;
    }
    return bytes;
  }
  function generateCode() {
    const secret = cryptoAPI().getRandomValues(new Uint8Array(20));
    try { return normalizeCode('DE1' + encodeBase32(secret)); }
    finally { secret.fill(0); }
  }
  function base64url(bytes) {
    let encoded;
    if (typeof Buffer !== 'undefined') encoded = Buffer.from(bytes).toString('base64');
    else {
      const chunks = [];
      for (let offset = 0; offset < bytes.length; offset += 32768) chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 32768)));
      encoded = btoa(chunks.join(''));
    }
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodeBase64url(value, maximum) {
    if (typeof value !== 'string' || value.length > maximum || !/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) fail('INVALID_DOCUMENT', '云端同步记录的编码格式不正确，原学习记录未被修改。');
    const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
    let bytes;
    try {
      if (typeof Buffer !== 'undefined') bytes = new Uint8Array(Buffer.from(padded, 'base64'));
      else bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
    } catch { return fail('INVALID_DOCUMENT', '云端同步记录的编码格式不正确，原学习记录未被修改。'); }
    if (base64url(bytes) !== value) fail('INVALID_DOCUMENT', '云端同步记录的编码不完整，原学习记录未被修改。');
    return bytes;
  }
  async function derive(code) {
    const crypto = cryptoAPI(), secret = decodeCode(code);
    let material;
    try { material = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveBits', 'deriveKey']); }
    finally { secret.fill(0); }
    const parameters = (purpose) => ({ name: 'HKDF', hash: 'SHA-256', salt: encoder.encode(NAMESPACE), info: encoder.encode(`${NAMESPACE}:${purpose}`) });
    const [key, roomBits, authBits] = await Promise.all([
      crypto.subtle.deriveKey(parameters('encryption-key'), material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']),
      crypto.subtle.deriveBits(parameters('room-id'), material, 256),
      crypto.subtle.deriveBits(parameters('authentication-secret'), material, 256)
    ]);
    const roomBytes = new Uint8Array(roomBits), authBytes = new Uint8Array(authBits);
    try { return { room: Array.from(roomBytes, (byte) => byte.toString(16).padStart(2, '0')).join(''), auth: base64url(authBytes), key }; }
    finally { roomBytes.fill(0); authBytes.fill(0); }
  }
  function checkKeys(keys) {
    if (!object(keys) || typeof keys.room !== 'string' || !/^[0-9a-f]{64}$/.test(keys.room) || typeof keys.auth !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(keys.auth)
      || !keys.key || keys.key.type !== 'secret' || keys.key.algorithm?.name !== 'AES-GCM' || keys.key.algorithm?.length !== 256
      || keys.key.extractable !== false || !keys.key.usages?.includes('encrypt') || !keys.key.usages?.includes('decrypt')) fail('INVALID_KEYS', '同步密钥不可用，请重新输入同步码。');
  }
  function jsonSafe(value, ancestors = new Set(), depth = 0) {
    if (depth > 32) fail('INVALID_DATA', '学习记录结构过深，原记录未被修改。');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('INVALID_DATA', '学习记录包含无效数字。'); return; }
    if (!Array.isArray(value) && !object(value)) fail('INVALID_DATA', '学习记录必须是普通 JSON 数据。');
    if (ancestors.has(value)) fail('INVALID_DATA', '学习记录包含循环引用。');
    ancestors.add(value);
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index++) jsonSafe(value[index], ancestors, depth + 1);
    } else {
      for (const name of Object.keys(value)) {
        if (['__proto__', 'prototype', 'constructor'].includes(name)) fail('INVALID_DATA', '学习记录包含不支持的字段。');
        jsonSafe(value[name], ancestors, depth + 1);
      }
    }
    ancestors.delete(value);
  }
  const additionalData = (room) => encoder.encode(`${NAMESPACE}:document:${VERSION}:${room}`);
  async function encrypt(envelope, keys) {
    checkKeys(keys);
    if (!object(envelope)) fail('INVALID_DATA', '学习记录必须是 JSON 对象。');
    jsonSafe(envelope);
    const serialized = JSON.stringify(envelope);
    // UTF-16 length is a cheap lower bound before allocating encoded bytes.
    if (serialized.length > MAX_PLAINTEXT_BYTES) fail('SIZE_LIMIT', '同步记录超过安全容量，请先导出完整备份；原记录未被删减。');
    const plaintext = encoder.encode(serialized);
    if (plaintext.length > MAX_PLAINTEXT_BYTES) { plaintext.fill(0); fail('SIZE_LIMIT', '同步记录超过安全容量，请先导出完整备份；原记录未被删减。'); }
    const crypto = cryptoAPI(), iv = crypto.getRandomValues(new Uint8Array(12));
    try {
      const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: additionalData(keys.room), tagLength: 128 }, keys.key, plaintext);
      return { version: VERSION, iv: base64url(iv), ciphertext: base64url(new Uint8Array(ciphertext)) };
    } finally { plaintext.fill(0); }
  }
  async function decrypt(document, keys) {
    checkKeys(keys);
    if (!object(document) || Object.keys(document).sort().join(',') !== 'ciphertext,iv,version' || document.version !== VERSION
      || typeof document.iv !== 'string' || document.iv.length !== 16 || typeof document.ciphertext !== 'string'
      || document.ciphertext.length < 22) fail('INVALID_DOCUMENT', '云端同步记录格式或版本不受支持，原学习记录未被修改。');
    if (document.ciphertext.length > MAX_CIPHERTEXT_CHARS) fail('SIZE_LIMIT', '云端同步记录超过安全容量，原学习记录未被修改。');
    const iv = decodeBase64url(document.iv, 16), ciphertext = decodeBase64url(document.ciphertext, MAX_CIPHERTEXT_CHARS);
    if (iv.length !== 12 || ciphertext.length < 16 || ciphertext.length > MAX_PLAINTEXT_BYTES + 16) fail('INVALID_DOCUMENT', '云端同步记录长度不正确，原学习记录未被修改。');
    let decrypted;
    try { decrypted = new Uint8Array(await cryptoAPI().subtle.decrypt({ name: 'AES-GCM', iv, additionalData: additionalData(keys.room), tagLength: 128 }, keys.key, ciphertext)); }
    catch { return fail('AUTHENTICATION_FAILED', '无法验证云端记录，请检查同步码；原学习记录未被修改。'); }
    try {
      let parsed;
      try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(decrypted)); }
      catch { return fail('INVALID_DATA', '解密后的学习记录格式不正确，原学习记录未被修改。'); }
      if (!object(parsed)) fail('INVALID_DATA', '解密后的学习记录必须是 JSON 对象。');
      jsonSafe(parsed);
      return parsed;
    } finally { decrypted.fill(0); }
  }
  const api = Object.freeze({ VERSION, MAX_PLAINTEXT_BYTES, MAX_CIPHERTEXT_CHARS, generateCode, normalizeCode, derive, encrypt, decrypt });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.DailyEnglishSyncCrypto = api;
})(typeof window !== 'undefined' ? window : null);
