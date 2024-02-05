# DB access through tRCP

Because I wanted to use [Kysely](https://www.kysely.dev/), and it wants to use `better_sqlite3`, and SvelteKit (or Vite) doesn't want to bundle that. Since I can't import `@neat-dhcpd/db` as a library, I decided to do a low-effort-yet-typesafe separation.
