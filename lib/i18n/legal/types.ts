/**
 * A legal document as data, so each language is a plain file of text.
 *
 * Text may use two bits of inline markup, rendered by <LegalDocument>:
 *   **bold**            and            [label](/path-or-https-url)
 */
export interface LegalDoc {
  /** Meta description for the page. */
  description: string;
  /** The "Last updated" line, already formatted. */
  updated: string;
  intro: string[];
  sections: LegalSection[];
}

export interface LegalSection {
  title: string;
  /** A string is a paragraph, an array of strings is a bullet list. */
  blocks: (string | string[])[];
}

export interface LegalDocs {
  privacy: LegalDoc;
  terms: LegalDoc;
}
