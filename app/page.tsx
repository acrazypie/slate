import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/types';
import { LanguageSelect } from '@/components/LanguageSelect';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { weekdayNames } from '@/lib/i18n/format';
import { getI18n } from '@/lib/i18n/server';

// Links are set at build time. Empty means "not published yet": the button shows as coming soon.
const APK_URL = process.env.NEXT_PUBLIC_APK_URL ?? '';
const SERVER_REPO_URL = process.env.NEXT_PUBLIC_SERVER_REPO_URL ?? '';

const PREVIEW_START = 8; // the grid runs from 08:00
const PREVIEW_HOURS = 9; // to 17:00
const PREVIEW_NOW = 11.5; // the now line, as in the app's day view
const SHIFT_COLOR = '#6BB6A3';

// Sample week for the illustration. `shift` draws a shift (a tint of its own
// colour); everything else is an event, tinted by its category.
type PreviewTitle = keyof Dictionary['landing']['preview'];
const PREVIEW_ITEMS: { day: number; start: number; hours: number; title: PreviewTitle; color: string; shift?: boolean }[] = [
  { day: 0, start: 1, hours: 2, title: 'calculus', color: CATEGORY_COLORS.lezione },
  { day: 0, start: 4, hours: 3, title: 'study', color: CATEGORY_COLORS.studio },
  { day: 1, start: 0, hours: 4, title: 'morningShift', color: SHIFT_COLOR, shift: true },
  { day: 1, start: 5, hours: 2, title: 'physics', color: CATEGORY_COLORS.lezione },
  { day: 2, start: 1, hours: 3, title: 'study', color: CATEGORY_COLORS.studio },
  { day: 2, start: 5, hours: 2, title: 'gym', color: CATEGORY_COLORS.altro },
  { day: 3, start: 0, hours: 4, title: 'morningShift', color: SHIFT_COLOR, shift: true },
  { day: 3, start: 5, hours: 3, title: 'project', color: CATEGORY_COLORS.lavoro },
  { day: 4, start: 1, hours: 2, title: 'calculus', color: CATEGORY_COLORS.lezione },
  { day: 4, start: 4, hours: 2, title: 'review', color: CATEGORY_COLORS.studio },
];

/** A static picture of the week in the Timeline layout: hours on the left, tinted blocks, a now line. */
function WeekPreview({ days, titles }: { days: string[]; titles: Dictionary['landing']['preview'] }) {
  const hourRows = Array.from({ length: PREVIEW_HOURS }, (_, i) => PREVIEW_START + i);
  const nowTop = ((PREVIEW_NOW - PREVIEW_START) / PREVIEW_HOURS) * 100;
  return (
    <div aria-hidden="true" className="w-full text-left">
      <div className="flex">
        <div className="w-9 flex-shrink-0 pt-7">
          <div className="relative h-72 sm:h-80">
            {hourRows.map((h, i) => (
              <span
                key={h}
                className="absolute right-1.5 -translate-y-1/2 text-[10px] leading-none text-text-secondary"
                style={{ top: `${(i / PREVIEW_HOURS) * 100}%` }}
              >
                {String(h).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-5 gap-1 sm:gap-1.5">
          {days.map((day, dayIndex) => (
            <div key={day} className="min-w-0">
              <div className="h-7 flex items-center justify-center text-[11px] font-medium tabular-nums text-text-tertiary">{day}</div>
              <div
                className="relative h-72 sm:h-80 border-l border-border"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
                  backgroundSize: `100% ${100 / PREVIEW_HOURS}%`,
                }}
              >
                {PREVIEW_ITEMS.filter((item) => item.day === dayIndex).map((item) => (
                  <div
                    key={`${item.start}-${item.title}`}
                    className="absolute left-0.5 right-0.5 rounded-xl px-1.5 py-1 overflow-hidden"
                    style={{
                      top: `calc(${(item.start / PREVIEW_HOURS) * 100}% + 1px)`,
                      height: `calc(${(item.hours / PREVIEW_HOURS) * 100}% - 2px)`,
                      backgroundColor: `color-mix(in srgb, ${item.color} 22%, var(--color-surface))`,
                    }}
                  >
                    <span className="block truncate text-[10px] sm:text-xs font-medium text-text-primary">
                      {titles[item.title]}
                    </span>
                  </div>
                ))}
                {dayIndex === 2 && (
                  <div className="absolute left-0 right-0 h-0.5 bg-[#E0475E] z-10" style={{ top: `${nowTop}%` }}>
                    <span className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-[#E0475E]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A way in: a row between hairlines, the title and where it goes. No descriptions. */
function Way({ title, cta, href, external }: { title: string; cta: string; href: string; external?: boolean }) {
  const body = (
    <>
      <span className="flex-1 min-w-0 text-base font-medium text-text-primary">{title}</span>
      <span className={`flex items-center gap-1.5 text-sm font-medium ${href ? 'text-accent-text' : 'text-text-tertiary'}`}>
        {cta}
        {href && <ArrowRight className="w-4 h-4" />}
      </span>
    </>
  );
  const classes = 'flex items-center gap-4 py-4 min-h-14 border-t border-border transition-colors hover:text-accent-text';
  if (!href) return <div className={classes}>{body}</div>;
  return external ? (
    <a href={href} className={classes}>{body}</a>
  ) : (
    <Link href={href} className={classes}>{body}</Link>
  );
}

export default async function Home() {
  const { locale, t } = await getI18n();
  const s = t.site;
  const days = weekdayNames(locale).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="mx-auto w-full max-w-5xl flex items-center justify-between px-5 pt-6">
        <span className="text-lg font-bold tracking-tight text-text-primary">Slate</span>
        <LanguageSelect />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-12 pb-20 md:pt-20 grid gap-14 md:grid-cols-[1fr_1.1fr] md:gap-16 md:items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-text-primary leading-[1.02]">
            {t.landing.tagline}
          </h1>
          <p className="mt-5 text-lg text-text-secondary">{t.landing.subtitle}</p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            {APK_URL ? (
              <a
                href={APK_URL}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-accent text-accent-contrast font-semibold transition-opacity hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                {s.downloadApk}
              </a>
            ) : (
              <span className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-surface-hover text-text-tertiary font-semibold whitespace-nowrap">
                {s.downloadSoon}
              </span>
            )}
            <span className="text-xs text-text-tertiary">{s.downloadNote}</span>
          </div>

          <nav className="mt-10 border-b border-border">
            <Way title={s.selfTitle} cta={s.selfCta} href="/self-host" />
            <Way title={s.cloudTitle} cta={s.cloudCta} href="/auth/login" />
          </nav>
        </div>

        <WeekPreview days={days} titles={t.landing.preview} />
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
        <Link href="/privacy" className="px-2 py-3 hover:text-text-secondary transition-colors">{t.common.privacy}</Link>
        <Link href="/terms" className="px-2 py-3 hover:text-text-secondary transition-colors">{t.common.terms}</Link>
        {SERVER_REPO_URL && (
          <a href={SERVER_REPO_URL} className="px-2 py-3 hover:text-text-secondary transition-colors">{s.repoLink}</a>
        )}
      </footer>
    </div>
  );
}
