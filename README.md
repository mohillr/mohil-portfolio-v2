# Message Viewer Website

This is a small separate website for viewing messages saved from your main website.

## How to connect it

Open `config.js` and fill in your Supabase settings:

```js
provider: "supabase",
supabase: {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_ANON_KEY",
  table: "messages"
}
```

If your database uses different column names, update the `fields` section.

Your Supabase table must allow the public anon key to read messages. In Supabase, check your table's Row Level Security policies and add a read/select policy if needed.

## How to publish

Upload this `message-viewer` folder to Netlify as a new site, or drag the folder into the Netlify deploy page.
