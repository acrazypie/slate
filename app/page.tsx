import Link from 'next/link';
import { ArrowRight, Download, Server, Cloud } from 'lucide-react';
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
    <div aria-hidden="true" className="w-full rounded-3xl bg-surface p-4 sm:p-5 text-left">
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
              <div className="h-7 flex items-center justify-center text-[11px] font-medium text-text-secondary">{day}</div>
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

/** One way in: a row of a grouped list, as in the app's settings. */
function Row({ icon, title, lede, cta, href, external }: { icon: React.ReactNode; title: string; lede: string; cta: string; href: string; external?: boolean }) {
  const body = (
    <>
      <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-accent-text flex-shrink-0">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-base font-semibold text-text-primary">{title}</span>
        <span className="block text-sm text-text-secondary leading-relaxed mt-0.5">{lede}</span>
      </span>
      <span className={`flex items-center gap-1 text-sm font-medium flex-shrink-0 ${href ? 'text-accent-text' : 'text-text-tertiary'}`}>
        <span className="hidden sm:inline">{cta}</span>
        {href && <ArrowRight className="w-4 h-4" />}
      </span>
    </>
  );
  const classes = 'flex items-center gap-4 px-5 py-4 min-h-[4.5rem]';
  if (!href) return <div className={classes}>{body}</div>;
  return external ? (
    <a href={href} className={`${classes} transition-colors hover:bg-surface-hover`}>{body}</a>
  ) : (
    <Link href={href} className={`${classes} transition-colors hover:bg-surface-hover`}>{body}</Link>
  );
}

export default async function Home() {
  const { locale, t } = await getI18n();
  const s = t.site;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="mx-auto w-full max-w-5xl flex items-center justify-between px-5 pt-6">
        <span className="text-lg font-bold tracking-tight text-text-primary">Slate</span>
        <LanguageSelect />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-10 pb-16 md:pt-16 grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-text-primary leading-[1.05]">
            {t.landing.tagline}
          </h1>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed">{t.landing.subtitle}</p>

          <section className="mt-8 rounded-3xl bg-surface divide-y divide-border overflow-hidden">
            <Row
              icon={<Download className="w-5 h-5" />}
              title={s.downloadTitle}
              lede={s.downloadLede}
              cta={APK_URL ? s.downloadApk : s.downloadSoon}
              href={APK_URL}
              external
            />
            <Row
              icon={<Server className="w-5 h-5" />}
              title={s.selfTitle}
              lede={s.selfLede}
              cta={s.selfCta}
              href="/self-host"
            />
            <Row
              icon={<Cloud className="w-5 h-5" />}
              title={s.cloudTitle}
              lede={s.cloudLede}
              cta={s.cloudCta}
              href="/auth/login"
            />
          </section>
          <p className="text-xs text-text-tertiary mt-3 px-1">{s.downloadNote}</p>
        </div>

        <WeekPreview days={weekdayNames(locale).slice(0, 5)} titles={t.landing.preview} />
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
        <Link href="/self-host" className="px-2 py-3 hover:text-text-secondary transition-colors">{s.selfCta}</Link>
        <Link href="/privacy" className="px-2 py-3 hover:text-text-secondary transition-colors">{t.common.privacy}</Link>
        <Link href="/terms" className="px-2 py-3 hover:text-text-secondary transition-colors">{t.common.terms}</Link>
        {SERVER_REPO_URL && (
          <a href={SERVER_REPO_URL} className="px-2 py-3 hover:text-text-secondary transition-colors">{s.repoLink}</a>
        )}
      </footer>
    </div>
  );
}
