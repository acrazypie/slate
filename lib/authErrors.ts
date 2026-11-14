// Supabase returns auth errors in English. The app is in Italian, so the ones a
// person can actually run into are translated here; anything else gets a
// generic message instead of raw API text.
const MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'Email o password non corretti.'],
  [/email not confirmed/i, "Conferma la tua email prima di accedere: controlla la posta."],
  [/user already registered/i, 'Esiste già un account con questa email. Prova ad accedere.'],
  [/password should be at least (\d+)/i, 'La password deve avere almeno $1 caratteri.'],
  [/same password|different from the old/i, 'La nuova password deve essere diversa da quella attuale.'],
  [/rate limit|too many requests|only request this after/i, 'Troppi tentativi. Aspetta un momento e riprova.'],
  [/invalid.*email|unable to validate email/i, "L'indirizzo email non è valido."],
  [/session missing|not authenticated|jwt/i, 'Il link è scaduto o non è valido. Richiedine uno nuovo.'],
  [/failed to fetch|network/i, 'Connessione non riuscita. Controlla la rete e riprova.'],
];

export function authErrorMessage(message: string): string {
  for (const [pattern, text] of MESSAGES) {
    const match = message.match(pattern);
    if (match) return text.replace('$1', match[1] ?? '');
  }
  return 'Qualcosa è andato storto. Riprova.';
}
