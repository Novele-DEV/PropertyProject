# Ledger - Property Invoicing Platform

A multi-tenant web application for property owners and managing firms to run the paperwork side of a rental business: properties, units, tenants, monthly invoicing, payments, collections and owner reporting, all in one place.

> **Status:** In active planning. A single-file browser prototype exists and is being rebuilt as a server-backed web application. Everything under "Planned stack" and "Roadmap" describes the target, not what is shipped today.

## Why this exists

Managing rentals usually means spreadsheets, hand-built invoices and manual reconciliation against bank statements. Ledger replaces that with one system that:

- keeps every firm's books completely separate,
- bills tenants automatically each month,
- matches bank payments to tenant accounts,
- and produces the reports owners ask for, with a full audit trail behind every number.

## Features

### Properties and units
- Multiple firms, each with isolated data and its own invoice numbering
- Multiple properties per firm, each with its own bank account for invoices and payment matching
- Units/rooms with pre-set rental prices, tenant assignment, occupancy and rental capacity

### Tenants
- Tenant records with contact details and lease period
- Account balances that update automatically from charges and payments
- Printable tenant statements and lease-expiry tracking

### Invoicing
- Single and mass invoice creation by property and billing month
- Automatic monthly invoice generation and email delivery
- Invoice history with filters for property, unit, tenant, status and calendar month
- Consolidated PDF download, credit notes and cancellations

### Payments and collections
- Manual payment capture
- Bank statement import (CSV/OFX) with automatic matching and a review queue for unmatched lines
- Collections view: expected, collected, outstanding, collection rate and overdue tenants, in total or per property

### Dashboard and reports
- Dashboard: properties, tenants, expected rent, outstanding, owner earnings, occupancy, rental capacity
- Mandatory reports: **rental collection**, **owner earnings** (rentals minus costs) and **monthly occupancy**
- Export to PDF and CSV

### Teams and security
- Employee logins with roles (admin, accountant, viewer)
- Append-only audit trail of all activity (who, what, when, old and new values)
- Live updates for multiple users working at once, with conflict protection so edits are never silently overwritten

## Planned stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core (C#) Web API, Entity Framework Core |
| Database | PostgreSQL |
| Frontend | React + TypeScript (Blazor under consideration) |
| Real-time | SignalR |
| Background jobs | Hangfire |
| PDFs | QuestPDF |
| Email | Postmark / SendGrid / Amazon SES |
| File storage | S3 / Azure Blob |
| Auth | ASP.NET Identity (SSO later) |
| Hosting | Azure |
| CI/CD and monitoring | GitHub Actions, Sentry |

## Architecture notes

- **Multi-tenancy:** a shared database with an `OrganizationId` on every table, enforced with row-level security.
- **Ledger-based accounting:** charges and payments are immutable entries. Balances and reports are derived from them and never edited directly. Mistakes are corrected by reversal.
- **Invoice numbering:** a per-firm counter incremented inside a database transaction so numbers never repeat or skip.
- **Money:** exact decimal types only.
- **Routing:** every screen has its own URL and return path, so Back goes where the user started and filters survive a refresh.

## Roadmap

1. **Core** - organizations, logins, properties, units, tenants, ledger, manual invoices and payments, dashboard
2. **Automation** - mass and monthly invoices, email sending, the three mandatory reports
3. **Control** - audit trail, live updates, bank statement import
4. **Commercial** - subscription billing, onboarding, SSO, optional live bank feeds


## Contributing

This is currently a private, in-house project. Contribution guidelines will be added if that changes.

## License

All rights reserved. License to be decided before commercial release.
