Account Verification — Creator / Merchant

Overview
- Feature adds account verification for creators/merchants.
- Users submit verification requests with required documents; admins review and approve/decline.

Migrations added
- 2026_05_19_000001_create_account_verifications_table.php
- 2026_05_19_000002_create_account_verification_documents_table.php
- 2026_05_19_000003_add_business_and_bank_columns_to_users.php

Models
- `App\Models\AccountVerification`
- `App\Models\AccountVerificationDocument`

Controllers & routes
- User-facing:
  - GET `/account/verification` — view submission page/status
  - POST `/account/verification` — submit verification (multipart/form-data)
  - GET `/account/verification/documents/{id}` — download document (authorized)
- Admin:
  - GET `/admin/verifications` — JSON list (supports `search`, `status`, `page`)
  - GET `/admin/verifications/{id}` — JSON detail
  - POST `/admin/verifications/{id}/approve` — approve
  - POST `/admin/verifications/{id}/decline` — decline (body: `{ reason: string }`)

Frontend
- User settings page: `resources/js/Pages/pengaturan/akun.tsx`
- Admin UI:
  - `resources/js/Pages/admin/verifications/Index.tsx`
  - `resources/js/Pages/admin/verifications/Show.tsx`

Seeder
- `database/seeders/RoleAndVerificationSeeder.php` creates sample admin and a pending creator verification.
- Registered in `database/seeders/DatabaseSeeder.php`.

Storage & security
- Documents stored on the `private` disk and served through controller endpoint which enforces authorization.

How to run
1. Run migrations:

```bash
php artisan migrate
```

2. Seed sample data:

```bash
php artisan db:seed
```

3. Start frontend build/watch:

```bash
npm run dev
```

Notes
- Decline endpoint expects a non-empty `reason` string.
- Payment creation is guarded to prevent unverified creators from creating payment links.
