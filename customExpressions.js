(function (root) {
  'use strict';

  // Tombstones reserve every issued ID. They are never pruned or used as study cards.
  const MAX_ITEMS = 500;
  const MAX_TOTAL_IDS = 5000;
  const LIMITS = Object.freeze({ phrase: 300, meaning_cn: 500, example: 1000, source: 500 });
  const PROVENANCE = Object.freeze(['user', 'model-assisted']);
  const ID_PATTERN = /^custom:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const FIELDS = [...Object.keys(LIMITS), 'provenance'];
  const RECORD_FIELDS = [...FIELDS, 'id', 'createdAt', 'updatedAt'];
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const plainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

  function checkObject(value, allowed, message) {
    if (!plainObject(value) || Object.keys(value).some((key) => !allowed.includes(key))) throw new Error(message);
  }

  function normalizePhrase(value) {
    return String(value).normalize('NFKC').replace(/[\u2018\u2019]/g, "'").replace(/\s+/gu, ' ').trim().toLowerCase();
  }

  function textField(value, field, required) {
    if (value === undefined && !required) return '';
    if (typeof value !== 'string' || value.length > LIMITS[field]
      || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)) {
      throw new Error(`${field} 格式不正确或超过 ${LIMITS[field]} 字符上限。`);
    }
    const text = value.trim();
    if (required && !text) throw new Error('请填写英文表达和中文提示。');
    return text;
  }

  function content(draft, previous) {
    checkObject(draft, FIELDS, '自定义表达字段不正确。');
    const value = { ...(previous || {}), ...draft };
    const result = {};
    for (const key of Object.keys(LIMITS)) result[key] = textField(value[key], key, ['phrase', 'meaning_cn'].includes(key));
    result.provenance = value.provenance === undefined ? 'user' : value.provenance;
    if (!PROVENANCE.includes(result.provenance)) throw new Error('表达来源标记不正确。');
    return result;
  }

  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
    const milliseconds = Date.parse(value);
    return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value;
  }

  function timestamp(now = Date.now()) {
    if (typeof now !== 'number' || !Number.isFinite(now)) throw new Error('时间格式不正确。');
    const value = new Date(now);
    if (!Number.isFinite(value.getTime())) throw new Error('时间格式不正确。');
    const result = value.toISOString();
    if (!validDate(result)) throw new Error('时间超出支持范围。');
    return result;
  }

  function readRecord(value) {
    checkObject(value, RECORD_FIELDS, '自定义表达记录格式不正确。');
    if (!ID_PATTERN.test(value.id) || !validDate(value.createdAt) || !validDate(value.updatedAt)
      || value.createdAt > value.updatedAt || !PROVENANCE.includes(value.provenance)) throw new Error('自定义表达标识或时间格式不正确。');
    const draft = Object.fromEntries(FIELDS.filter((key) => own(value, key)).map((key) => [key, value[key]]));
    return { id: value.id, ...content(draft), createdAt: value.createdAt, updatedAt: value.updatedAt };
  }

  function validate(saved) {
    if (!plainObject(saved) || ['__proto__', 'constructor', 'prototype'].some((key) => own(saved, key))) throw new Error('进度必须是 JSON 对象。');
    const items = saved.customExpressions === undefined ? [] : saved.customExpressions;
    const deleted = saved.deletedCustomExpressions === undefined ? [] : saved.deletedCustomExpressions;
    if (!Array.isArray(items) || !Array.isArray(deleted) || items.length > MAX_ITEMS
      || items.length + deleted.length > MAX_TOTAL_IDS) throw new Error('自定义表达数量超过上限或格式不正确。');
    const ids = new Set();
    const phrases = new Set();
    const customExpressions = Array.from(items, (value) => {
      const record = readRecord(value);
      const key = normalizePhrase(record.phrase);
      if (ids.has(record.id) || phrases.has(key)) throw new Error('自定义表达包含重复的标识或英文。');
      ids.add(record.id);
      phrases.add(key);
      return record;
    });
    const deletedCustomExpressions = Array.from(deleted, (value) => {
      checkObject(value, ['id', 'deletedAt'], '已删除表达记录格式不正确。');
      if (!ID_PATTERN.test(value.id) || !validDate(value.deletedAt) || ids.has(value.id)) throw new Error('已删除表达标识或时间格式不正确。');
      ids.add(value.id);
      return { id: value.id, deletedAt: value.deletedAt };
    });
    return { customExpressions, deletedCustomExpressions };
  }

  function findDuplicate(items, phrase, exceptId = null) {
    const key = normalizePhrase(phrase);
    return items.find((item) => item.id !== exceptId && normalizePhrase(item.phrase) === key) || null;
  }

  function randomUuid() {
    const crypto = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
    if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    if (crypto && typeof crypto.getRandomValues === 'function') {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    // Fail without changing the collection rather than creating collision-prone IDs.
    throw new Error('浏览器不支持安全生成表达标识，请使用较新的浏览器。');
  }

  function create(saved, draft, { now = Date.now(), uuid = randomUuid } = {}) {
    const result = validate(saved);
    if (result.customExpressions.length >= MAX_ITEMS) throw new Error(`最多保存 ${MAX_ITEMS} 条自定义表达。`);
    if (result.customExpressions.length + result.deletedCustomExpressions.length >= MAX_TOTAL_IDS) {
      throw new Error(`此进度的表达标识已达 ${MAX_TOTAL_IDS} 条上限，请先导出备份。`);
    }
    const fields = content(draft);
    if (findDuplicate(result.customExpressions, fields.phrase)) throw new Error('已保存相同的英文表达，请编辑原来的条目。');
    const id = `custom:${uuid()}`;
    if (!ID_PATTERN.test(id) || [...result.customExpressions, ...result.deletedCustomExpressions].some((item) => item.id === id)) {
      throw new Error('无法生成新的表达标识，请重试。');
    }
    const at = timestamp(now);
    result.customExpressions.push({ id, ...fields, createdAt: at, updatedAt: at });
    return result;
  }

  function update(saved, id, draft, { now = Date.now() } = {}) {
    const result = validate(saved);
    const index = result.customExpressions.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('这条表达不存在或已删除。');
    const previous = result.customExpressions[index];
    const fields = content(draft, previous);
    if (findDuplicate(result.customExpressions, fields.phrase, id)) throw new Error('已保存相同的英文表达，请编辑原来的条目。');
    const at = timestamp(now);
    if (at < previous.updatedAt) throw new Error('当前时间早于表达记录，请检查设备时间。');
    result.customExpressions[index] = { id: previous.id, ...fields, createdAt: previous.createdAt, updatedAt: at };
    return result;
  }

  function remove(saved, id, { now = Date.now() } = {}) {
    const result = validate(saved);
    const index = result.customExpressions.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('这条表达不存在或已删除。');
    const at = timestamp(now);
    if (at < result.customExpressions[index].updatedAt) throw new Error('当前时间早于表达记录，请检查设备时间。');
    result.customExpressions.splice(index, 1);
    result.deletedCustomExpressions.push({ id, deletedAt: at });
    return result;
  }

  function asExpression(value) {
    const item = readRecord(value);
    return { ...item, category: '我的表达', level: '自定义', tags: ['custom'], example_cn: '' };
  }

  const api = Object.freeze({ MAX_ITEMS, MAX_TOTAL_IDS, LIMITS, PROVENANCE, normalizePhrase, findDuplicate, validate, create, update, remove, asExpression });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.CustomExpressions = api;
})(typeof window !== 'undefined' ? window : null);
