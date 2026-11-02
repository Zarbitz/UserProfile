# Requirements audit

| Diagram requirement | Current implementation | Acceptance still needed |
|---|---|---|
| Website to signup/signin | Web links and old account routes hand off to `/account/` | Browser test through unified server |
| Email OTP | Better Auth + SMTP | Live delivery, expiry, reuse and abuse checks |
| Phone OTP | Better Auth + Twilio SMS | Authorized sender and destination-country configuration |
| Google / Apple | Provider configuration + UI | Real credentials, consent, redirects and Apple secret renewal |
| Profile verification | Verified email/phone required by API | Live provider session validation |
| Admin approval | Pending by default, admin approve/suspend UI, server checks | Two-user access and revocation tests on PostgreSQL |
| User profile | Organization editing and identity display | Additional company/address fields can be added if required |
| New user assets | Service selector, name, map point/polygon, manual GeoJSON | Browser checks on Mac |
| Existing assets | PostgreSQL owner-scoped list and platform link | Restart persistence and cross-user denial |
| Agri platform | Existing UI receives selected asset context | Missing Agri KPI backend; original demo metrics must not be treated as selected-asset measurements |
| Dams platform | Extracted existing viewer with asset-scoped Zarr requests | Dataset schema compatibility; reader still contains legacy Temghar defaults |
| Building platform | Authorized asset page | No original monitoring implementation existed; scientific viewer remains missing |
| Zarr on Mac Mini | Read-only bind mount, owner checks, path containment | Actual Mac path, per-customer store separation, real dataset loading |
| Reports | Owner-scoped requests and channel selection | Scientific generation, review/publication and notification worker remain unimplemented |
| Email/mobile/WhatsApp reports | Verified contact checks on requests | Actual report delivery not implemented; WhatsApp requires approved messaging configuration |
| Enquiries | Database persistence and retried SMTP delivery | Actual mailbox delivery; retries may duplicate notifications after an acknowledgement failure |
| Mac Mini operations | Compose, environment template, installation/cutover/backup/restore rulebook | Run and validate on actual Mac |

This release is an integration foundation, not a fully verified production monitoring product. Do not expose it to real customer data before the rulebook acceptance checks and missing scientific/reporting functions are completed.
