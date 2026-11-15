import type { Locale } from '../config';
import type { LegalDocs } from './types';
import { it } from './it';
import { en } from './en';
import { es } from './es';
import { nl } from './nl';
import { fr } from './fr';
import { ja } from './ja';

export type { LegalDoc, LegalDocs } from './types';

export const legalDocs: Record<Locale, LegalDocs> = { it, en, es, nl, fr, ja };
