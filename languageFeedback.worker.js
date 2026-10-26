// Third-party engines load only after a learner explicitly requests feedback.
import { LocalLinter, Dialect } from './vendor/harper/index.js';
import { binary } from './vendor/harper/binary.js';
let linter;
self.onmessage = async ({ data }) => {
  try {
    linter ||= new LocalLinter({ binary, dialect: Dialect.American });
    const lints = await linter.lint(data.text, { language: 'plaintext' });
    const issues = [];
    for (const lint of lints) {
      if (issues.length < 30) {
        const suggestions = lint.suggestions();
        issues.push({ kind: lint.lint_kind(), message: lint.message(), excerpt: lint.get_problem_text(),
          fixes: await Promise.all(suggestions.slice(0, 3).map(async (s) => ({ label: s.get_replacement_text(), text: await linter.applySuggestion(data.text, lint, s) }))) });
        suggestions.forEach(s => s.free());
      }
      lint.free();
    }
    self.postMessage({ id: data.id, issues, engine: 'Harper 2.13.0' });
  } catch { self.postMessage({ id: data.id, error: '语言检查暂时未能完成。请保留文本，稍后重试。' }); }
};
