# PropertyProject - Repository Structure Guide (Vertical Slice Architecture)

A guide to how the repository is organised, who works where, and how a feature moves from the database to the screen.

**Stack:** ASP.NET Core (C#, .NET 10) · PostgreSQL · React + TypeScript (Vite)
**Backend architecture:** Vertical slices. Code is grouped by feature (Invoices, Tenants, ...) rather than by technical layer (controllers, services, data).

---

## 1. The big picture

```
PropertyProject/
├── backend/     C# server code, organised by feature
├── frontend/    React app: what users see and click
├── docs/        Requirements and design notes
└── root files   Project-wide settings
```

A request travels like this:

```
Browser -> Frontend (React) -> /api/... -> Controller -> Handler -> Database
                                          (all inside one feature folder)
Browser <- Frontend (React) <------------- JSON response <---------+
```

---

## 2. What "vertical slice" means

**Layered (old way):** everything of one kind lives together. To change "invoices" you open the Controllers folder, then Services, then Entities, then Data. One feature is spread across the whole project.

**Vertical slice (this project):** everything for one feature lives together. To change "invoices" you open `Features/Invoices/` and find the controller, handler, and (later) request types and validation in one place.

Why we chose it:
- A feature can be built, changed and reviewed in one folder.
- Two developers rarely edit the same files, because features are separate.
- New features are added by adding a folder, not by editing many shared layers.

Rules of the slices:
- Each feature folder is self-contained.
- **A feature must not reference another feature's folder directly.** Anything shared goes in `Domain/` or `Infrastructure/`.
- Controllers stay thin: they receive the request and pass it to the handler.
- All the work for a request lives in the handler.

---

## 3. Who works where

| Area | What it covers | Folders |
|---|---|---|
| **Backend** | Handlers, controllers, domain entities, database | `backend/` |
| **Frontend logic** | Fetching data, state, forms, validation, routing | `frontend/Web/src/api`, `hooks`, `App.tsx`, `main.tsx` |
| **UI design** | Layout, components, styling, how screens look | `frontend/Web/src/pages`, `components` |
| **Fullstack** | A feature that needs changes in every area above | Touches all of the above |

**Fullstack work** means taking one feature through every layer. For example, "show collections per property" needs a handler and endpoint in the backend, an API call and hook in the frontend, and a page and components for the UI.

### Team split

This is a two-person team:

| Person | Owns | Touches |
|---|---|---|
| **Developer 1 (frontend)** | All frontend functionality and UI design | Everything in `frontend/Web/` |
| **Developer 2 (backend)** | Handlers and controllers | `backend/Api/Features/` (each feature's controller and handler) |

**Ownership rule:** Developer 2 does not edit anything in `frontend/`. Developer 1 builds all frontend functionality (API calls, state, forms, routing) and UI in their own files. The two meet at the API: Developer 2 exposes endpoints through controllers and handlers, and Developer 1 consumes them from `frontend/Web/src/api/`. Agree the endpoint shapes (URL, request, response) before building each feature so neither side is blocked.

Shared backend code (`Domain/` and `Infrastructure/`) is changed by Developer 2 as features require.

---

## 4. Root files

| File | Purpose |
|---|---|
| `PropertyProject.slnx` | Solution file listing the C# projects (Api and Api.Tests). Open this to load the whole backend. |
| `README.md` | The project's front page on GitHub. |
| `.gitignore` | Files Git must never track (build output, `node_modules`, secrets). |
| `.editorconfig` | Shared formatting rules for every editor. |
| `docker-compose.yml` | Starts a local PostgreSQL database with one command. |
| `docs/` | Requirements, architecture notes, client brief. |

---

## 5. Backend (`backend/`)

The backend is one API project plus one test project.

```
backend/
├── Api/
│   ├── Program.cs
│   ├── PropertyProject.Api.csproj
│   ├── Domain/
│   │   └── Entities/
│   │       ├── Organization.cs
│   │       ├── Property.cs
│   │       ├── Unit.cs
│   │       ├── Tenant.cs
│   │       ├── Invoice.cs
│   │       ├── Payment.cs
│   │       └── LedgerEntry.cs
│   ├── Infrastructure/
│   │   └── Persistence/
│   │       └── AppDbContext.cs
│   └── Features/
│       ├── Properties/   PropertiesController.cs, PropertiesHandler.cs
│       ├── Units/        UnitsController.cs, UnitsHandler.cs
│       ├── Tenants/      TenantsController.cs, TenantsHandler.cs
│       ├── Invoices/     InvoicesController.cs, InvoicesHandler.cs
│       ├── Payments/     PaymentsController.cs, PaymentsHandler.cs
│       └── Reports/      ReportsController.cs, ReportsHandler.cs
└── Api.Tests/
    ├── PropertyProject.Api.Tests.csproj
    └── InvoicesHandlerTests.cs
```

### 5.1 Entry point
| File | Purpose |
|---|---|
| `Program.cs` | Where the app starts. Registers services, sets up the request pipeline, runs the server. Not a class: it is a script of startup instructions. |
| `PropertyProject.Api.csproj` | Project settings and package references. Rarely edited by hand. |

### 5.2 `Features/` - the slices
Each feature folder contains:

| File | Purpose |
|---|---|
| `<Feature>Controller.cs` | Exposes endpoints such as `/api/invoices` and passes each request to the handler. Thin. |
| `<Feature>Handler.cs` | Carries out the request from start to finish: validates input, applies the rules, reads and writes the database, returns the result. |

As a feature grows, its own request and response types and validation are added to the same folder. Nothing outside the folder needs to change.

| Feature | Responsibility |
|---|---|
| `Properties` | Properties, per-property bank account |
| `Units` | Units/rooms, rental prices, tenant assignment |
| `Tenants` | Tenant records, balances, statements |
| `Invoices` | Single and mass invoicing, numbering, history, VAT |
| `Payments` | Manual payments, bank statement matching |
| `Reports` | Collections, owner earnings, occupancy |

### 5.3 `Domain/Entities/` - shared
The things in the system: `Organization`, `Property`, `Unit`, `Tenant`, `Invoice`, `Payment`, `LedgerEntry`. Each becomes a database table. Entities are shared by all slices.

### 5.4 `Infrastructure/Persistence/` - shared
| File | Purpose |
|---|---|
| `AppDbContext.cs` | The bridge between entities and PostgreSQL. Will list the tables and configuration. Database migrations (change history) are generated here later. |

### 5.5 `Api.Tests/`
| File | Purpose |
|---|---|
| `InvoicesHandlerTests.cs` | Checks that invoicing, VAT and numbering logic are correct. Priority area for tests because the system handles money. |

---

## 6. Frontend (`frontend/Web/`)

The frontend splits into **logic** (how it works) and **UI design** (how it looks). Keeping them apart means a designer can change a screen without touching data code, and a developer can change data handling without breaking the layout. All of it is owned by Developer 1.

### 6.1 Project setup files
| File | Purpose |
|---|---|
| `package.json` | Lists libraries and run commands (`npm run dev`). |
| `index.html` | The single page the browser loads; React fills it in. |
| `vite.config.ts` | Configuration for Vite, the tool that runs and builds the app. |
| `tsconfig.json` | TypeScript rules. |

### 6.2 Frontend logic (`src/`)
| File / folder | Purpose |
|---|---|
| `main.tsx` | Starts React and mounts the app into the page. |
| `App.tsx` | Top-level component. Will hold routing between pages. |
| `api/client.ts` | Functions that call the backend (e.g. fetch invoices, create payment). |
| `hooks/` | Reusable logic such as "load invoices with filters". |

Typical tasks: calling the API, keeping filters in the URL, loading and error states, form validation, remembering where the user came from so Back works correctly.

### 6.3 UI design (`src/`)
| Folder | Purpose |
|---|---|
| `pages/` | One file per screen: `DashboardPage`, `PropertiesPage`, `TenantsPage`, `InvoicesPage`, `PaymentsPage`, `ReportsPage`. |
| `components/` | Reusable visual pieces: tables, buttons, filters, cards, modals. |

Typical tasks: layout, spacing, colours, typography, responsive behaviour, accessibility.

**Rule:** pages assemble components and use hooks for data. They should not contain raw API calls or business calculations.

---

## 7. How to navigate: following one feature end to end

Example: **list properties.**

| Step | File | Owner |
|---|---|---|
| 1. Define what a property is | `backend/Api/Domain/Entities/Property.cs` | Developer 2 |
| 2. Register it as a table | `backend/Api/Infrastructure/Persistence/AppDbContext.cs` | Developer 2 |
| 3. Write the handler | `backend/Api/Features/Properties/PropertiesHandler.cs` | Developer 2 |
| 4. Expose it at `/api/properties` | `backend/Api/Features/Properties/PropertiesController.cs` | Developer 2 |
| 5. Add the call | `frontend/Web/src/api/client.ts` | Developer 1 |
| 6. Add a hook if needed | `frontend/Web/src/hooks/` | Developer 1 |
| 7. Build the screen | `frontend/Web/src/pages/PropertiesPage.tsx` and `components/` | Developer 1 |

**Rule of thumb:** what it is -> `Domain` · how it is saved -> `Infrastructure` · how a request is handled and reached -> `Features/<Feature>` · how data reaches the screen -> frontend logic · how it looks -> UI design.

---

## 8. Running the project

```bash
# Backend
dotnet run --project backend/Api

# Frontend (first time: npm install)
cd frontend/Web
npm install
npm run dev
```

Note: the frontend does not yet forward `/api` requests to the backend. That is a small addition to `vite.config.ts`, to be done when the first endpoint is connected.

---

## 9. Current status

- This guide describes the target structure. The backend is being restructured from the earlier Core / Data / Api layout into the single-project vertical slice layout above.
- `docker-compose.yml`, `.gitignore` and `.editorconfig` are still empty and need content before the first commit.
- No entities, endpoints, database configuration or screens have been implemented yet.
