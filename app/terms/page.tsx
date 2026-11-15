import type { Metadata } from 'next';
import { LegalDocument } from '@/components/LegalDocument';
import { legalDocs } from '@/lib/i18n/legal';
import { getI18n } from '@/lib/i18n/server';

// The text lives in lib/i18n/legal, one file per language. Italian is the original.

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: `${t.common.terms} — Slate`,
    description: legalDocs[locale].terms.description,
  };
}

export default async function TermsOfServicePage() {
  const { locale, t } = await getI18n();

  return (
    <LegalDocument
      title={t.common.terms}
      doc={legalDocs[locale].terms}
      backLabel={t.legal.backHome}
      notice={locale === 'it' ? undefined : t.legal.translationNotice}
    />
  );
}
