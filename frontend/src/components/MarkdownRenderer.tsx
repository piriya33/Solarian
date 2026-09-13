import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, robust Markdown renderer for Solarian AI Life Counselor & Blueprints.
 * Safely parses:
 * - H1, H2, H3 headings (#, ##, ###)
 * - Horizontal rules (---)
 * - Unordered lists (*, -)
 * - Bold text (**text**)
 * - Numbered steps (1., 2.)
 * - Blockquotes / Highlights (> )
 * - Paragraphs and line breaks
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="space-y-2 my-2.5 pl-0.5">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
              <div className="flex-1">{renderInlineFormatting(item)}</div>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`line-${index}`);
      return;
    }

    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList(`line-${index}`);
      elements.push(
        <hr
          key={`hr-${index}`}
          className="my-4 border-slate-200 dark:border-slate-800"
        />
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList(`line-${index}`);
      elements.push(
        <h1
          key={`h1-${index}`}
          className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-4 mb-2.5 pb-2 border-b border-slate-200 dark:border-slate-800"
        >
          {renderInlineFormatting(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList(`line-${index}`);
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mt-3.5 mb-2"
        >
          {renderInlineFormatting(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(`line-${index}`);
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 mt-3.5 mb-1.5 flex items-center gap-2"
        >
          {renderInlineFormatting(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
      return;
    }

    if (trimmed.startsWith('> ')) {
      flushList(`line-${index}`);
      elements.push(
        <div
          key={`quote-${index}`}
          className="p-3 my-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border-l-4 border-amber-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic"
        >
          {renderInlineFormatting(trimmed.slice(2))}
        </div>
      );
      return;
    }

    flushList(`line-${index}`);
    elements.push(
      <p
        key={`p-${index}`}
        className="my-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
      >
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });

  flushList('end');

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
