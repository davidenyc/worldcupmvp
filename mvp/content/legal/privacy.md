# Privacy Policy

**Effective date:** {{effective_date}}
**Last updated:** {{last_updated}}

This is the privacy policy for **GameDay Map** ("we", "us", "our"), a web app at gamedaymap.com that helps fans find bars and restaurants for World Cup 2026 matches. We wrote this to be readable. If anything is unclear, email **privacy@gamedaymap.com** and we'll explain in plain language.

> **NOTE:** This policy is not legal advice. It documents our current practices for product-counsel review. A licensed attorney in the user's jurisdiction must approve before launch.

---

## 1. The short version

- We collect the minimum we need to make the product useful.
- We don't sell your personal data, ever.
- You can export or delete your account at any time, in-app, with one click.
- We use a small number of third parties (listed in §6). They're contractually limited to processing your data on our behalf.
- For users in the EU/UK, California, and Quebec, additional rights apply (§9, §10).

---

## 2. What we collect

**You give us directly:**
- Email address (required for accounts and alerts).
- Display name (optional).
- Home city, supporter country, notification preferences.
- Saved venues, saved matches, group memberships.
- Venue submissions (name, address, photos, your relationship to the venue).
- Payment details — handled and stored by Stripe, not by us. We see only the last 4 digits, brand, and country of the card.

**We collect automatically:**
- Standard request logs: IP, user agent, referrer, timestamp.
- Page view, click, and search events with the event name and a small set of properties (e.g. city, country, tier). Stored in PostHog (§6).
- Approximate geolocation (city-level, derived from IP) for default city selection. We do not collect precise GPS unless you grant browser permission to the "near me" filter.

**We do not collect:**
- Your contacts, calendar, photos, or files.
- Your social media identities unless you explicitly link them.
- Audio, video, or biometric data.
- Information about visitors who block our analytics — we respect Do-Not-Track and Global Privacy Control headers.

---

## 3. How we use it

- **To run the product:** show the right venues, run filters, persist saves, send alerts you opted into, complete reservations.
- **To bill you (paid tiers only):** Stripe processes payment; we receive only what Stripe shows us in the customer object.
- **To improve the product:** aggregate usage analytics to find what works and what doesn't. We never look at individual user behavior except to debug issues you've reported.
- **To communicate:** transactional emails (receipts, alerts, account changes) are unavoidable while you have an account. Marketing emails are opt-in and one-click unsubscribe.
- **To keep things safe:** detect abuse, fraud, scraping, and bot activity.

---

## 4. Legal bases (EU/UK)

- **Contract**: providing the service you signed up for.
- **Legitimate interest**: security, abuse prevention, and limited analytics.
- **Consent**: marketing emails, push notifications, precise geolocation.
- **Legal obligation**: tax and accounting records.

You can withdraw consent at any time without affecting the lawfulness of prior processing.

---

## 5. Sharing

We share data only with:

- **Service providers** acting as data processors on our behalf (§6).
- **Authorities** when required by law, valid legal process, or to prevent imminent harm. We push back on overbroad requests and notify users when legally permitted.
- **Acquirers** in the event of a sale or merger — successors must honor this policy or notify users to consent or delete.

We do not share with advertisers, data brokers, or other apps.

---

## 6. Subprocessors

| Vendor       | Purpose                          | Data shared                          | Region           |
|--------------|----------------------------------|--------------------------------------|------------------|
| Stripe       | Payment processing               | Name, email, card (handled by Stripe)| US/EU            |
| Vercel       | Hosting                          | Standard request logs                | US/EU/global edge|
| Mapbox       | Maps and tiles                   | IP, viewport coordinates             | US               |
| PostHog      | Product analytics                | Pseudonymous user ID, events         | US/EU (your choice)|
| Resend       | Transactional + marketing email  | Email, message content               | US               |
| Cloudflare   | DDoS, CDN                        | IP, request metadata                 | Global           |
| Google Places (Maps Photos) | Venue photos via reference URLs | None of yours; the URL is keyed to the venue | US |

A current list is at gamedaymap.com/legal/subprocessors. We notify users at least 30 days before adding a new subprocessor that processes personal data, except where security or contractual urgency requires otherwise.

---

## 7. Retention

- **Account data**: kept while your account is active. Deleted within 30 days of account deletion request, except where law requires longer (e.g. tax records up to 7 years).
- **Event analytics**: 13 months by default, then aggregated and pseudonymized.
- **Transactional emails**: 30 days in our outbound mail logs.
- **Backups**: encrypted backups retained up to 35 days, then overwritten.

---

## 8. Security

- TLS 1.2+ everywhere.
- Encryption at rest for production databases.
- Stripe handles card data — we don't store it.
- Production access is limited to a short list of named team members with two-factor auth.
- We will publish a security.txt at /.well-known/security.txt with our disclosure address.

No system is perfectly secure. If we discover a breach affecting your data, we will notify you within 72 hours of confirming the incident and provide what we know, what we don't, and what we recommend.

---

## 9. EU/UK rights (GDPR)

You have the right to:
- Access the data we hold on you.
- Correct inaccurate data.
- Erase your data ("right to be forgotten").
- Restrict or object to processing based on legitimate interest.
- Portability — get your data in a machine-readable format (JSON).
- Lodge a complaint with your supervisory authority. (We'd appreciate a chance to fix it first.)

To exercise any right, email **privacy@gamedaymap.com** or use the controls in /account.

---

## 10. California (CCPA/CPRA) and Quebec (Law 25)

Categories of personal information we collect: identifiers (email, IP), commercial information (subscription tier, transaction history), internet/network activity (event analytics), and geolocation (city-level derived from IP).

You have the right to know, to delete, to correct, and to opt out of "sale" or "sharing." We do not sell or share personal information for cross-context behavioral advertising.

To exercise rights, email **privacy@gamedaymap.com** or use /account. We will verify your identity through an active session or email confirmation. You may designate an authorized agent in writing.

For Quebec users, our privacy officer is reachable at **privacy@gamedaymap.com**.

---

## 11. Children

GameDay Map is not directed at children under 13 (or 16 in the EU). We do not knowingly collect data from them. If you believe a child has provided us data, email privacy@gamedaymap.com and we will delete it.

---

## 12. International transfers

We're based in the United States. Data may be processed in the US, EU, or wherever our subprocessors operate. For EU/UK users, we rely on Standard Contractual Clauses with subprocessors and apply additional safeguards as required.

---

## 13. Changes to this policy

We'll post the updated date at the top and notify account holders by email at least 14 days before material changes take effect. Continued use after the effective date means acceptance.

---

## 14. Contact

- **Email:** privacy@gamedaymap.com
- **Postal:** {{company_legal_name}}, {{company_address}}
- **Data Protection Officer (EU):** {{dpo_name_or_company}}, {{dpo_email}}
