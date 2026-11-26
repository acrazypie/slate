import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LanguageSelect } from '@/components/LanguageSelect';
import { getI18n } from '@/lib/i18n/server';

const SERVER_REPO_URL = process.env.NEXT_PUBLIC_SERVER_REPO_URL ?? '';

export default async function SelfHost() {
  const { t } = await getI18n();
  const s = t.site;
  return (
    <div className="min-h-screen bg-bg px-5 py-10">
      <main className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors rounded-full px-3 py-2 -ml-3 mb-8">
          <ArrowLeft className="w-4 h-4" /> {s.back}
        </Link>
        <h1 className="font-semibold tracking-tight text-4xl md:text-5xl text-text-primary mb-4">{s.selfPageTitle}</h1>
        <p className="text-text-secondary mb-2">{s.selfPageLede}</p>
        <p className="text-sm text-text-tertiary mb-10">{s.selfStatus}</p>

        <ol className="rounded-3xl bg-surface divide-y divide-border overflow-hidden mb-10">
          {s.selfSteps.map((step, i) => (
            <li key={i} className="flex gap-4 px-5 py-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-accent-text text-sm font-semibold shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-text-primary leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        {SERVER_REPO_URL ? (
          <a href={SERVER_REPO_URL} className="inline-flex items-center px-6 h-12 rounded-2xl bg-accent text-accent-contrast font-semibold text-sm hover:opacity-90 transition-opacity">{s.repoLink}</a>
        ) : (
          <span className="inline-flex items-center px-6 h-12 rounded-2xl bg-surface text-text-tertiary text-sm">{s.repoSoon}</span>
        )}

        <footer className="mt-16 flex flex-wrap gap-2 text-xs text-text-tertiary">
          <Link href="/privacy" className="px-2 py-3 hover:text-text-secondary">{t.common.privacy}</Link>
          <Link href="/terms" className="px-2 py-3 hover:text-text-secondary">{t.common.terms}</Link>
          <LanguageSelect className="px-2" />
        </footer>
      </main>
    </div>
  );
}
