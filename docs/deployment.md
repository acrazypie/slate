# Deployment

Slate is built to run on [Vercel](https://vercel.com). It needs no custom
build settings: Vercel detects Next.js and runs `npm run build`.

## First deploy

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import the repository.
3. Under **Environment Variables**, add the variables from
   [setup.md](setup.md#3-environment-variables) for the Production
   environment (and Preview, if you want preview deployments to work):

   | Variable | Notes |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | |
   | `GOOGLE_OAUTH_CLIENT_ID` | Only for Google Calendar sync |
   | `GOOGLE_OAUTH_CLIENT_SECRET` | Only for Google Calendar sync. Mark as sensitive |

4. Deploy.

`NEXT_PUBLIC_*` values are compiled into the client bundle at build time.
After changing one, redeploy; a restart is not enough.

## After the first deploy

In Supabase, **Authentication → URL Configuration**:

- Set **Site URL** to the production domain.
- Add the production callbacks to **Redirect URLs**:

  ```
  https://<your-domain>/auth/callback**
  https://<your-domain>/auth/google-calendar/callback
  ```

If you use Google sign-in or calendar sync, nothing changes in Google Cloud
when you add a domain: Google redirects to Supabase
(`https://<project-ref>.supabase.co/auth/v1/callback`), and Supabase redirects
to the app.

## Preview deployments

Each Vercel preview has its own hostname, and Supabase only redirects to URLs
on its allow list. To make sign-in work on previews, add a wildcard entry such
as `https://*-<your-team>.vercel.app/**` to Redirect URLs. Previews share the
production database unless you point their environment variables at a second
Supabase project.

## Production checklist

- [ ] Schema from [database.md](database.md#full-schema) applied, RLS enabled
      on all five tables
- [ ] Environment variables set in Vercel
- [ ] Supabase Site URL and Redirect URLs include the production domain
- [ ] Email confirmation and the email templates configured in Supabase
      (the default sender is rate-limited; set up custom SMTP for real use)
- [ ] Google OAuth consent screen published, if Google features are on
- [ ] Sign up, sign in, password reset and sign out tested on the live domain

## Other hosts

Any host that runs a Node.js Next.js server (`npm run build`, then
`npm run start`) works. The app uses middleware and route handlers, so it
cannot be exported as a static site.
