import { BookOpen, Laptop, GraduationCap, Pin } from 'lucide-react';
import { BlockCategory } from '@/lib/types';

// "Lavoro" is a laptop, not a briefcase: the briefcase already means a shift.
const ICONS: Record<BlockCategory, typeof BookOpen> = {
  studio: BookOpen,
  lavoro: Laptop,
  lezione: GraduationCap,
  altro: Pin,
};

export function CategoryIcon({ category, className }: { category: BlockCategory; className?: string }) {
  const Icon = ICONS[category] ?? Pin;
  return <Icon className={className} aria-hidden="true" />;
}
