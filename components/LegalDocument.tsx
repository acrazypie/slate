import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { LegalDoc } from '@/lib/i18n/legal';

const linkClass = 'text-accent-text hover:underline';

/** Turns the **bold** and [label](href) markup used in the legal text into elements. */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const [whole, bold, label, href] = match;
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    if (bold) {
      parts.push(
        <strong key={index} className="text-text-primary">
          {bold}
        </strong>
      );
    } else if (href.startsWith('/')) {
      parts.push(
        <Link key={index} href={href} className={linkClass}>
          {label}
        </Link>
      );
    } else {
      parts.push(
        <a key={index} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label}
        </a>
      );
    }
    last = index + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Block({ block }: { block: string | string[] }) {
  if (typeof block === 'string') {
    return <p className="text-sm text-text-secondary leading-relaxed mb-3">{renderInline(block)}</p>;
  }
  return (
    <ul className="list-disc pl-5 text-sm text-text-secondary leading-relaxed space-y-2 mb-3">
      {block.map((item, i) => (
        <li key={i}>{renderInline(item)}</li>
      ))}
    </ul>
  );
}

interface LegalDocumentProps {
  title: string;
  doc: LegalDoc;
  backLabel: string;
  /** Shown above translated versions; omitted for the Italian original. */
  notice?: string;
}

/** Shared page layout for the privacy policy and the terms of service. */
export function LegalDocument({ title, doc, backLabel, notice }: LegalDocumentProps) {
  return (
    <div className="min-h-screen bg-bg px-5 py-10 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors rounded-full px-3 py-2 -ml-3 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        <h1 className="font-semibold tracking-tight text-3xl sm:text-4xl text-text-primary mb-2">{title}</h1>
        <p className="text-xs text-text-tertiary mb-10">{doc.updated}</p>

        {notice && (
          <p className="text-sm text-text-secondary bg-surface rounded-3xl px-4 py-3 mb-6">
            {notice}
          </p>
        )}

        {doc.intro.map((paragraph, i) => (
          <Block key={i} block={paragraph} />
        ))}

        {doc.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-text-primary mt-10 mb-3">{section.title}</h2>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
