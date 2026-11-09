import React from 'react';
import katex from 'katex';

interface MathProps {
  text?: string;
  content?: string;
  className?: string;
}

/**
 * Parses markdown/plain text and renders LaTeX segments delimited by `$...$` or `$$...$$`
 * using KaTeX. Falls back gracefully to plain text if syntax is irregular.
 */
export const MathRenderer: React.FC<MathProps> = ({ text, content, className = '' }) => {
  const rawText = text || content || '';
  if (!rawText) return null;

  // Split by inline math $...$ and display math $$...$$
  const parts: React.ReactNode[] = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>{rawText.substring(lastIndex, match.index)}</span>
      );
    }

    const token = match[0];
    const isDisplay = token.startsWith('$$');
    const formula = isDisplay ? token.slice(2, -2) : token.slice(1, -1);

    try {
      const html = katex.renderToString(formula.trim(), {
        displayMode: isDisplay,
        throwOnError: false,
      });

      parts.push(
        <span
          key={`math-${match.index}`}
          className={isDisplay ? 'block my-2 text-center' : 'inline-block mx-0.5'}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      parts.push(<span key={`fallback-${match.index}`}>{token}</span>);
    }

    lastIndex = regex.lastIndex;
  }

  // Push remainder
  if (lastIndex < rawText.length) {
    parts.push(<span key={`text-end`}>{rawText.substring(lastIndex)}</span>);
  }

  return <span className={className}>{parts}</span>;
};
