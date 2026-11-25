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

const PREVIEW_HOURS = 8; // 08:00 to 16:00

// Sample week for the illustration below. `shift` draws the dashed style shifts
// have on the real grid; everything else is an event.
type PreviewTitle = keyof Dictionary['landing']['preview'];
const PREVIEW_ITEMS: { day: number; start: number; hours: number; title: PreviewTitle; color: string; shift?: boolean }[] = [
  { day: 0, start: 1, hours: 2, title: 'calculus', color: CATEGORY_COLORS.lezione },
  { day: 0, start: 4, hours: 3, title: 'study', color: CATEGORY_COLORS.studio },
  { day: 1, start: 0, hours: 4, title: 'morningShift', color: '#6BB6A3', shift: true },
  { day: 1, start: 5, hours: 2, title: 'physics', color: CATEGORY_COLORS.lezione },
  { day: 2, start: 1, hours: 3, title: 'study', color: CATEGORY_COLORS.studio },
  { day: 2, start: 5, hours: 2, title: 'gym', color: CATEGORY_COLORS.altro },
  { day: 3, start: 0, hours: 4, title: 'morningShift', color: '#6BB6A3', shift: true },
  { day: 3, start: 5, hours: 3, title: 'project', color: CATEGORY_COLORS.lavoro },
  { day: 4, start: 1, hours: 2, title: 'calculus', color: CATEGORY_COLORS.lezione },
  { day: 4, start: 4, hours: 2, title: 'review', color: CATEGORY_COLORS.studio },
];

/** A static picture of the week grid, drawn with the app's own block styles. */
function WeekPreview({ days, titles }: { days: string[]; titles: Dictionary['landing']['preview'] }) {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-xl bg-surface border border-border rounded-2xl p-3 sm:p-4 text-left"
    >
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {days.map((day, dayIndex) => (
          <div key={day} className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wide text-text-secondary text-center mb-2">
              {day}
            </div>
            <div
              className="relative h-44 sm:h-52 rounded-lg bg-bg"
              style={{
                backgroundImage: 'linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
                backgroundSize: `100% ${100 / PREVIEW_HOURS}%`,
              }}
            >
              {PREVIEW_ITEMS.filter((item) => item.day === dayIndex).map((item) => (
                <div
                  key={`${item.start}-${item.title}`}
                  className={`absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 overflow-hidden ${
                    item.shift ? 'border border-dashed' : ''
                  }`}
                  style={{
                    top: `calc(${(item.start / PREVIEW_HOURS) * 100}% + 1px)`,
                    height: `calc(${(item.hours / PREVIEW_HOURS) * 100}% - 2px)`,
                    backgroundColor: `color-mix(in srgb, ${item.color} 22%, var(--color-surface))`,
                    ...(item.shift ? { borderColor: item.color } : { borderLeft: `3px solid ${item.color}` }),
                  }}
                >
                  <span className="block truncate text-[10px] sm:text-xs font-medium text-text-primary">
                    {titles[item.title]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ icon, title, lede, cta, href, external }: { icon: React.ReactNode; title: string; lede: string; cta: string; href: string; external?: boolean }) {
  const classes = 'inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-contrast font-medium text-sm transition-opacity hover:opacity-90';
  return (
    <div className="flex-1 min-w-[16rem] rounded-2xl border border-border bg-surface p-6 text-left flex flex-col gap-4">
      <div className="text-accent-text">{icon}</div>
      <h2 className="font-serif text-2xl text-text-primary">{title}</h2>
      <p className="text-sm text-text-secondary leading-relaxed flex-1">{lede}</p>
      {href ? (
        external ? (
          <a href={href} className={classes}>{cta}<ArrowRight className="w-4 h-4" /></a>
        ) : (
          <Link href={href} className={classes}>{cta}<ArrowRight className="w-4 h-4" /></Link>
        )
      ) : (
        <span className="inline-flex items-center px-5 py-3 rounded-xl border border-border text-text-tertiary text-sm">{cta}</span>
      )}
    </div>
  );
}

export default async function Home() {
  const { locale, t } = await getI18n();
  const s = t.site;

  return (
    <div className="min-h-screen flex flex-col items-center bg-bg px-4 py-12">
      <main className="max-w-4xl w-full flex flex-col items-center text-center">
        <h1 className="font-serif text-6xl md:text-8xl text-text-primary mb-4">Slate</h1>
        <p className="text-xl md:text-2xl text-text-secondary mb-3">{t.landing.tagline}</p>
        <p className="text-text-secondary text-sm mb-10">{t.landing.subtitle}</p>

        <section className="w-full flex flex-wrap gap-4 justify-center">
          <Card
            icon={<Download className="w-6 h-6" />}
            title={s.downloadTitle}
            lede={s.downloadLede}
            cta={APK_URL ? s.downloadApk : s.downloadSoon}
            href={APK_URL}
            external
          />
          <Card
            icon={<Server className="w-6 h-6" />}
            title={s.selfTitle}
            lede={s.selfLede}
            cta={s.selfCta}
            href="/self-host"
          />
          <Card
            icon={<Cloud className="w-6 h-6" />}
            title={s.cloudTitle}
            lede={s.cloudLede}
            cta={s.cloudCta}
            href="/auth/login"
          />
        </section>

        <p className="text-xs text-text-tertiary mt-4">{s.downloadNote}</p>

        <div className="mt-12 w-full flex justify-center">
          <WeekPreview days={weekdayNames(locale).slice(0, 5)} titles={t.landing.preview} />
        </div>
      </main>

      <footer className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs text-text-tertiary">
        <Link href="/self-host" className="px-2 py-3 hover:text-text-secondary transition-colors">{s.selfCta}</Link>
        <Link href="/privacy" className="px-2 py-3 hover:text-text-secondary transition-colors">{t.common.privacy}</Link>
        <Link href="/terms" className="px-2 py-3 hover:text-text-secondary transition-colors">{t.common.terms}</Link>
        {SERVER_REPO_URL && (
          <a href={SERVER_REPO_URL} className="px-2 py-3 hover:text-text-secondary transition-colors">{s.repoLink}</a>
        )}
        <LanguageSelect className="px-2" />
      </footer>
    </div>
  );
}
