# ZARBITZ Mac Mini installation and deployment rulebook

## 1. Scope and release status

Run this deployment on the Mac Mini. Windows was used to prepare code only. Antigravity is your editor/terminal environment; it is not the production process supervisor. Docker Compose runs the services independently of the editor.

The account service provides Google/Apple configuration, email/phone OTP, profile editing, administrator approval, owned assets with Point/Polygon geometry, a map-based selection UI, protected platform entry points, administrator dataset assignment, enquiry persistence and email retry, and report request tracking.

**Remaining release blockers:** no live provider credentials or Mac Mini datasets were available during development. Full authentication/database/runtime tests must pass on the Mac before publication. Agri's original KPI backend is absent. Building has an asset entry page only because its repository was empty. Report requests are recorded but analysis generation and SMS/WhatsApp report delivery are not implemented. Do not describe these as completed monitoring services.

## 2. Directory layout

Keep repositories as siblings on the Mac:

```text
~/Zarbitz/
  Web/          # Dev branch; website copied from the Windows source
  Agri/         # Dev branch; existing agricultural frontend
  Dams/         # main; extracted observatory
  Building/     # main; asset entry page
  UserProfile/  # main; shared API, UI, Compose and this guide
```

Zarr stays on the Mac Mini, outside these repositories. Never commit Zarr stores, customer records, credentials, `.env` or database backups.

## 3. Install prerequisites

Install Git/Xcode command-line tools (`xcode-select --install`) and Docker Desktop for your Mac's chip. Open Docker Desktop and wait for its engine to start. In Antigravity open `~/Zarbitz` and use its terminal. Confirm `git --version`, `docker --version`, and `docker compose version`. Node is included in the application container; local Node 22+ is needed only for rebuilding the Dams frontend.

```sh
mkdir -p ~/Zarbitz
cd ~/Zarbitz
git clone -b Dev https://github.com/Zarbitz/Web.git
git clone -b Dev https://github.com/Zarbitz/Agri.git
git clone https://github.com/Zarbitz/Dams.git
git clone https://github.com/Zarbitz/Building.git
git clone https://github.com/Zarbitz/UserProfile.git
cd UserProfile
cp .env.example .env
chmod 600 .env
openssl rand -hex 32
openssl rand -hex 32
```

Use separate generated values for POSTGRES_PASSWORD and BETTER_AUTH_SECRET. Using hexadecimal avoids URL-encoding problems in DATABASE_URL. Edit `.env` locally in Antigravity; never paste secrets into prompts or Git commits.

## 4. Set Mac Mini paths and local settings

Initially use `PUBLIC_URL=http://localhost:8080`. Set ADMIN_EMAILS to the exact email of your administrator. That address must be verified through Google or email OTP; being listed does not bypass identity verification.

Set `ZARR_HOST_PATH` to the existing absolute directory on the Mac, for example `/Volumes/ZarbitzData/zarr`. Replace this example with your real path. Confirm the drive is mounted and Docker Desktop has access to it. Compose mounts it read-only at `/data`. Do not mount an entire home directory.

Example assignment: if the store is `/Volumes/ZarbitzData/zarr/customer-a/dam-1.zarr`, enter `customer-a/dam-1.zarr` in the administrator UI. Each assigned store must contain ONLY data that the asset's owner is authorized to read. The server authorizes the entire assigned store, not individual dam groups inside a shared master store. Split a multi-customer master store before assigning it.

The existing dam reader expects the master store schema with `zarr.json` and `dams/<PIC>/...`, including its existing codecs and grid assumptions. Arbitrary Zarr layouts are not interchangeable. Agri needs its missing KPI extraction service implemented against the actual agricultural schema. No datasets are copied from Windows.

## 5. Configure email and login providers

Email: use a transactional SMTP provider, verify your sending domain with its supplied SPF/DKIM DNS records in Cloudflare, then set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and MAIL_FROM. Port 465 uses TLS immediately; 587 uses SMTP negotiation. ENQUIRY_TO defaults to `zatbitzlabs@gmail.com` (confirm that spelling). Email OTP and enquiry notifications use this sender.

Google: create an OAuth Web Application in Google Cloud Console. Configure consent/branding and add callback `http://localhost:8080/api/auth/callback/google` for local development, then `https://www.zarbitz.com/api/auth/callback/google` for production. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. Publish the OAuth app appropriately before allowing real users.

Apple: create a Services ID with Sign in with Apple, register the HTTPS domain and return URL `https://www.zarbitz.com/api/auth/callback/apple`. Generate a client-secret JWT using your Apple developer key, Team ID and Key ID, and set APPLE_CLIENT_ID and APPLE_CLIENT_SECRET. Track its expiry and renew it. Apple requires a properly configured HTTPS environment; localhost testing does not prove Apple sign-in works.

Phone OTP: this implementation uses **Twilio Programmable Messaging**, not Verify. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and an authorized TWILIO_FROM sender. Enable required countries and complete local sender/template registrations as required by Twilio. Enter phone numbers in international E.164 format. Trial accounts may restrict destination numbers. Better Auth generates and verifies the OTP; Twilio transports it. Do not configure a Verify Service SID in place of the sender.

Different login methods can produce different accounts. Do not merge users based on unverified names or phone/email claims. Account-linking UI is not supplied in this release.

## 6. Start locally on the Mac

```sh
cd ~/Zarbitz/UserProfile
docker compose config --quiet
docker compose build app
docker compose up -d db
docker compose run --rm app npm run migrate
docker compose up -d app
docker compose ps
curl --fail http://localhost:8080/health
```

Open `http://localhost:8080/` and `http://localhost:8080/account/`. Only the app is published to the Mac loopback interface; PostgreSQL has no public port. The local read-only platform mounts allow code updates without copying files into the container. Rebuild the app when UserProfile code changes.

## 7. User approval and asset workflow

1. Sign in as the administrator using the verified email in ADMIN_EMAILS.
2. New profiles default to `pending`. Pending users can edit organization details; asset creation, platform access, reports and Zarr are blocked server-side.
3. Open **Manage user approvals** in the account page and approve users individually. An administrator can approve their own profile to use customer features.
4. The approved customer refreshes the account page, chooses Agriculture/Dams/Building, supplies a name, then clicks a map point or draws boundary corners and finishes the polygon. Manual GeoJSON is also accepted.
5. The asset is saved to PostgreSQL under that user's ID. Existing users see their saved assets after login.
6. The administrator assigns the asset's relative dataset path. Customers cannot set paths themselves.
7. Customer opens the platform with the selected asset UUID. API requests check session, approval and ownership. Asset IDs are identifiers, never authorization secrets.

Suspension blocks API/platform access at the next request. The UI does not constitute the security boundary. Reports currently remain requests for administrator review; they are not automatically generated or delivered.

## 8. Cloudflare production connection

Only after local acceptance checks pass, set `PUBLIC_URL=https://www.zarbitz.com` and update OAuth callbacks. Recreate the app with `docker compose up -d --force-recreate app`.

In Cloudflare One create a named Cloudflare Tunnel. Store its token in `.env` as TUNNEL_TOKEN. Add a public hostname `www.zarbitz.com` pointing to **HTTP `app:8080`**, because the connector runs in the same Compose network. Start it with:

```sh
docker compose --profile public up -d tunnel
docker compose logs --tail=50 tunnel
```

Before changing DNS, record existing records and Worker/custom-domain routes. The existing Web repository includes Cloudflare Worker routing for the domain: detach or migrate the conflicting route during a planned cutover; do not leave the old Worker intercepting the hostname. Point the hostname at the named tunnel using Cloudflare's dashboard workflow. Configure the apex `zarbitz.com` to redirect to the canonical `https://www.zarbitz.com`.

Bypass caching for `/api/*`, `/account/*` and customer platform paths. Do not configure Cache Everything for private data. A public web hostname should not be protected by an unrelated Cloudflare Access login unless intentionally required. Never publish PostgreSQL or the old standalone Dams Python server directly.

## 9. Acceptance checklist before public use

- Correct and incorrect/expired/reused OTPs; resend throttling; Google and Apple callback success and failure.
- New verified user is pending, cannot create an asset or access platforms, and can edit their profile.
- Administrator approves a user; user gains access after refresh. Suspension removes it.
- Create users A and B; B cannot fetch A's asset, Zarr chunks or reports even with A's UUID.
- Pending users cannot bypass restrictions using a direct API URL.
- Point and polygon creation persist across restarts; malformed coordinates are rejected.
- Assign a small authorized test store and verify the dam reader loads correct observations. Test nonexistent paths, `..`, encoded traversal and symlinks outside the mount.
- Enquiry is stored; notification arrives at the target inbox. SMTP failure preserves the record for retry.
- No fabricated agricultural/building results are presented as the selected asset's measurements.
- Restore a backup into a separate test database and verify profile/asset counts.
- Reboot the Mac and verify Docker, database, application and tunnel recover.

## 10. Backups, updates and recovery

Daily database backup (run from UserProfile):

```sh
mkdir -p backups
chmod 700 backups
docker compose exec -T db pg_dump -U zarbitz -d zarbitz -Fc > "backups/zarbitz-$(date +%Y%m%d-%H%M%S).dump"
```

Copy encrypted backups to a separate location. Back up Zarr separately; the database backup contains paths, not dataset content. Retain secrets securely outside Git and record the exact commit of every repository with `git rev-parse HEAD`.

Restore first into a NEW database, never overwrite production as a first attempt:

```sh
docker compose exec db createdb -U zarbitz zarbitz_restore
docker compose exec -T db pg_restore -U zarbitz -d zarbitz_restore < backups/SELECTED-BACKUP.dump
```

Before updating, take a backup and record commits. Fetch and review repository changes, use `git pull --ff-only` on the intended branches, rebuild, run migrations once, and repeat acceptance checks. Do not use `docker compose down -v`; it deletes the database volume. Rollback requires compatible code AND schema, or a separately verified database restore.

Set Docker Desktop to start at login, prevent Mac sleep while powered, and test power-loss recovery. Docker Desktop may require a user login after reboot; FileVault can require manual unlock. Document this operational dependency rather than assuming containers recover unattended. Use a UPS and an external uptime check. Inspect logs with `docker compose logs --tail=100 app db` and disk space with `df -h`.

## 11. Antigravity handoff

Open the sibling repositories as a workspace. Read this guide and REQUIREMENTS.md first. Keep production secrets out of prompts and generated files. Request changes in the owning repository, run checks, review diffs, commit, then deploy a coordinated set of commits. Antigravity does not replace provider setup, database administration or the missing scientific processing pipelines.

Official references: https://better-auth.com/docs/plugins/email-otp ; https://better-auth.com/docs/plugins/phone-number ; https://better-auth.com/docs/authentication/apple ; https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/get-started/create-remote-tunnel/ ; https://docs.docker.com/desktop/setup/install/mac-install/
