(function () {
  'use strict';

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function sourceUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url : null;
    } catch {
      return null;
    }
  }

  // Return null for expressions without usage metadata. Callers reveal this
  // only alongside the reference answer, never inside a recall prompt or hint.
  window.createExpressionUsage = function (item) {
    if (!item || typeof item !== 'object') return null;
    const register = text(item.register);
    const note = text(item.usage_note);
    const alternative = text(item.neutral_alternative);
    const source = sourceUrl(item.source_url);
    if (!register && !note && !alternative && !source) return null;

    const usage = document.createElement('div');
    usage.className = 'expression-usage';

    if (register) {
      const tag = document.createElement('span');
      tag.className = 'usage-register';
      tag.textContent = register;
      usage.appendChild(tag);
    }
    if (note) {
      const paragraph = document.createElement('p');
      paragraph.className = 'usage-note';
      paragraph.textContent = note;
      usage.appendChild(paragraph);
    }
    if (alternative) {
      const paragraph = document.createElement('p');
      paragraph.className = 'usage-alternative';
      const label = document.createElement('span');
      label.textContent = '更中性的说法';
      const phrase = document.createElement('span');
      phrase.lang = 'en';
      phrase.textContent = alternative;
      paragraph.append(label, phrase);
      usage.appendChild(paragraph);
    }
    if (source) {
      const details = document.createElement('details');
      details.className = 'usage-source';
      const summary = document.createElement('summary');
      summary.textContent = '用法来源';
      const link = document.createElement('a');
      const sourceLabel = text(item.source_label) || source.hostname;
      link.textContent = sourceLabel;
      link.href = source.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${sourceLabel}（在新标签页打开）`);
      details.append(summary, link);
      const verifiedAt = text(item.verified_at);
      if (/^\d{4}-\d{2}-\d{2}$/.test(verifiedAt)) {
        const date = document.createElement('span');
        date.className = 'usage-verified';
        date.textContent = `核对于 ${verifiedAt}`;
        details.appendChild(date);
      }
      usage.appendChild(details);
    }
    return usage;
  };

  document.getElementById('browseTrendingBtn')?.addEventListener('click', () => {
    document.getElementById('expressionSource').value = 'all';
    document.getElementById('searchInput').value = '';
    document.getElementById('levelFilter').value = 'all';
    const category = document.getElementById('categoryFilter');
    category.value = '流行口语';
    window.setView('library');
    category.focus();
  });
})();
