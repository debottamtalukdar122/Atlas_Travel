# Atlas & Isle — Tour Website + Admin CRM

A responsive React/Vite/Tailwind public travel site paired with a Laravel REST API and MySQL-backed single-admin CRM. The CRM is the source of truth for packages, destination content, enquiries, bookings and operational records. Public enquiries and booking requests are validated and written to the same CRM store.

## Project layout

- `src/` — public React site, tour detail and enquiry experience, private CRM UI, API client.
- `backend/` — Laravel API project, Sanctum token authentication, migrations and admin seeder.
- `.env.example`, `backend/.env.example` — frontend and backend configuration templates.

## Requirements

- Node.js 20+ and npm
- PHP 8.2+ with PDO MySQL, OpenSSL, Mbstring, XML, Ctype, JSON, Fileinfo, Tokenizer and cURL extensions
- Composer 2
- MySQL 8+

## First-time setup

1. Create a MySQL database and account. For a local development database:

   ```sql
   CREATE DATABASE atlas_travel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'atlas_app'@'localhost' IDENTIFIED BY 'replace-with-a-strong-password';
   GRANT ALL PRIVILEGES ON atlas_travel.* TO 'atlas_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. Install frontend dependencies and copy the environment template:

   ```powershell
   npm install
   Copy-Item .env.example .env
   ```

3. Install Laravel dependencies and configure the backend:

   ```powershell
   Set-Location backend
   composer install
   Copy-Item .env.example .env
   ```

   Set `DB_DATABASE=atlas_travel`, `DB_USERNAME=atlas_app`, and `DB_PASSWORD` to the values you created. Set a unique `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` in `backend/.env` before seeding. The seeder creates or updates the single administrator and removes any other admin account; it does not provide a default password.

4. Initialize and start the API:

   ```powershell
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve --host=127.0.0.1 --port=8000
   ```

5. In a second terminal at the project root:

   ```powershell
   npm run dev
   ```

   Open <http://localhost:5173>. The CRM entry point is the “For the curious” link in the header. Use the administrator email/password you set in `backend/.env`.

## Production build

```powershell
npm run build
```

Set `VITE_API_URL` to the public API base (default `http://127.0.0.1:8000/api`) before building for deployment. Configure the web server document root to `backend/public`; never expose the backend project root or `.env`.

## API surface

Public endpoints: `GET /api/public/packages`, `GET /api/public/destinations`, `GET /api/public/blogs`, `POST /api/public/enquiries`, `POST /api/public/bookings`, and `POST /api/public/subscribers`.

Admin endpoints require the bearer token returned by `POST /api/admin/login`: dashboard and global search, plus paginated CRUD endpoints under `/api/admin/{module}` for enquiries, bookings, customers, packages, destinations, quotations, payments, invoices, follow-ups, hotels, transport, blogs, offers, gallery and settings. Admin login and public submission routes are rate limited. Package, destination and blog public reads include only records marked `published`.

## Data, files and security notes

The migration creates users, sessions, Sanctum personal access tokens, notifications and a MySQL JSON record store partitioned by module. Module payloads retain the fields supplied by the CRM forms, allowing the modules to evolve without destructive schema changes. Customer and booking references are currently stored as entered record IDs rather than enforced relational foreign keys. Administrative tokens expire after 12 hours and each new login revokes prior admin tokens. Keep `APP_DEBUG=false` in production, use HTTPS, back up the database, and restrict the admin URL at the network edge where appropriate.

Uploads are not exposed through a public endpoint yet; use Laravel's private disk for sensitive passport/identity documents when implementing that workflow. Do not put sensitive documents in public media storage.

## External integrations

- Email currently defaults to Laravel's `log` mailer. Configure SMTP (`MAIL_MAILER=smtp`, host, port, username, password, encryption and from address) to send real email.
- Online gateway checkout/webhooks, WhatsApp and SMS delivery require provider credentials and provider-specific implementation. The project records manual payment entries; it does not claim online payment processing is active.
- Maps/social links and final legal copy/company contact details should be replaced with the travel company's real information.

## Current scope and known gaps

Public pages include the home/brand story, curated journey cards, tour detail and enquiry form. The CRM has login, dashboard metrics, searchable/paginated module lists and generic create/edit/delete flows. The CRUD API and MySQL persistence are implemented for the documented modules.

The first release does not yet include password-reset email/OTP, online checkout/refunds, outbound email/WhatsApp/SMS composition and delivery, upload/replace/download UI, generated quotation/invoice PDFs, spreadsheet exports, rich content page editing, full public blog/destination detail routes, detailed analytics charts, multi-page server-side filters, or automated follow-up/notification delivery. These require further feature work and/or provider credentials. The visual public cards include editorial starter content until published packages are entered in the CRM.
