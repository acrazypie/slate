import type { Locale } from '../config';
import { it, type Dictionary } from './it';
import { en } from './en';
import { es } from './es';
import { nl } from './nl';
import { fr } from './fr';
import { ja } from './ja';

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { it, en, es, nl, fr, ja };
