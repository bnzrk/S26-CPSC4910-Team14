# Refactor Plan

Maps the existing frontend codebase against the Figma designs — what exists, what needs to change, and where to find it.

---

## Page → File Mapping

| Page | Route(s) | Component File | Auth Required |
|---|---|---|---|
| About / Landing | `/` and `/about` | `pages/About/AboutPage.jsx` | No |
| Driver Dashboard | `/points` | `pages/Points/PointsPage.jsx` | DRIVER only |
| Sponsor Dashboard | `/org` (index) | `pages/SponsorOrg/Index/SponsorOrgPage.jsx` | SPONSOR only |
| Sponsor — Point Rules | `/org/point-rules` | `pages/SponsorOrg/PointRules/PointRulesPage.jsx` | SPONSOR only |
| Sponsor — Users | `/org/users` | `pages/SponsorOrg/Users/SponsorUsersPage.jsx` | SPONSOR only |
| Sponsor — Drivers | `/org/drivers` | `pages/SponsorOrg/Drivers/SponsorDriversPage.jsx` | SPONSOR only |
| Sponsor — Driver Detail | `/org/drivers/:driverId` | `pages/SponsorOrg/Drivers/SponsorDriverPage.jsx` | SPONSOR only |
| Admin | `/admin` | `pages/Admin/Tools/AdminToolsPage.jsx` | ADMIN only |
| Login | `/login` | `pages/Login/LoginPage.jsx` | No |
| Register | `/register` | `pages/Register/RegisterPage.jsx` | No |
| Profile | `/profile` | `pages/Profile/ProfilePage.jsx` | Any logged-in |

**Router file:** `src/App.jsx` lines 51–91 (React Router DOM v7)

---

## Post-Login Routing

### Current Flow

1. `LoginPage.jsx` (lines 16–47): On success, navigates to `/about` for all user types
2. Navbar (`NavBar.jsx` lines 19–84) renders role-specific nav buttons after login:
   - **Driver** (lines 69–77): Points display → click goes to `/points`
   - **Sponsor** (lines 78–80): "Organization" button → `/org`
   - **Admin** (lines 82–84): "Tools" button → `/admin`
3. `ProtectedRoute.jsx` (lines 10–14): If user lacks the required `userType`, redirects to `/`

### Key Files

| File | Role |
|---|---|
| `src/routes/ProtectedRoute.jsx` | Role guard |
| `src/api/currentUser.js` | Queries `/auth/me`, returns `user.userType` (`"Driver"`, `"Sponsor"`, `"Admin"`) |
| `src/components/Navbar/NavBar.jsx` line 55+ | Role-conditional rendering |

### Gap vs Figma Design

Figma shows dedicated dashboards with sidebar nav. Current app routes login → `/about` with a top navbar. There is no automatic role-based redirect on login (e.g., drivers should land on `/points`, sponsors on `/org`).

---

## Shared vs Page-Specific Components

### Shared (all pages)

| Component | File | Notes |
|---|---|---|
| `NavBar` | `components/Navbar/NavBar.jsx` | Rendered in `App.jsx` line 50; wraps all routes |
| `Card` | `components/Card/Card.jsx` | Header/body/footer structure |
| `CardHost` | `components/CardHost/CardHost.jsx` | Page title wrapper |
| `Toast / ToastHost` | `main.jsx` + ToastProvider | Global notifications |

### Shared (some pages)

| Component | Used By |
|---|---|
| `Button` / `AsyncButton` | Login, Register, Profile, Points, Sponsor pages |
| `Modal` | Sponsor pages (point rules) |
| `Loader` | Any page with async data |
| `ListItem` | Points history, sponsor driver lists |

### Page-Specific Layouts

| Layout | File | Used By |
|---|---|---|
| `SponsorOrgLayout` | `pages/SponsorOrg/SponsorOrgLayout.jsx` | All `/org/*` routes via `<Outlet>` |
| Self-contained login/register | Respective Page files | Login, Register |
| Self-contained hero + two-col form | `ProfilePage.jsx` | Profile |

### Gap vs Figma Design

The Figma designs show a fixed 260px sidebar with full app navigation for both the Driver and Sponsor dashboards. The current implementation uses a top navbar only. The `SponsorOrgLayout` is the closest existing structure to a scoped layout, but it does not implement a sidebar.

---

## Hardcoded Styles / Inline CSS to Replace

### NavBar.jsx (highest priority — shared component)

| Line | Current | Action |
|---|---|---|
| 55 | `style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}` | Move to `NavBar.module.scss` |
| 59 | `style={{ fontSize: '0.9rem', opacity: 0.8 }}` | Move to `NavBar.module.scss` |

### About page sub-components (low priority — legitimately dynamic)

| File | Line(s) | Note |
|---|---|---|
| `HowItWorks.jsx` | 25 | `style={{ transitionDelay: \`${i * 120}ms\` }}` — dynamic, acceptable as-is |
| `TeamSection.jsx` | 21, 25 | Animation delay + avatar color array — dynamic, acceptable as-is |
| `FeatureCards.jsx` | 25 | `style={{ transitionDelay: \`${i * 100}ms\` }}` — dynamic, acceptable as-is |

### SkeletonLoader.jsx (intentionally dynamic — do not change)

Lines 7, 17–40: Dynamic `width`/`height` props passed by callers. These must stay inline.

**Summary:** Only the 2 static inline styles in `NavBar.jsx` need refactoring. All others are legitimately dynamic.

---

## CSS Architecture

### Pattern

SCSS Modules per component + two global files.

| File | Role |
|---|---|
| `src/index.scss` | CSS custom properties (`:root`): colors, fonts, global resets |
| `src/styles/_globals.scss` | SCSS variables: spacing (`$grid-1x`–`$grid-6x`), breakpoints |
| `src/components/**/*.module.scss` | Per-component scoped styles |
| `src/pages/**/*.module.scss` | Per-page scoped styles |

### Current Global CSS Variables (`index.scss`)

```css
--color-bg: #FAFBFC
--color-text: #0C1117
--color-accent: #0A6847
--color-caution: #e6b11f
--color-warn: #c94552
--color-success: #3FB180
--font-heading: 'Playfair Display'
--font-body: 'DM Sans'
```

### SCSS Spacing Variables (`_globals.scss`)

| Variable | Value |
|---|---|
| `$grid-fourth` | `2px` |
| `$grid-half` | `4px` |
| `$grid-1x` | `8px` |
| `$grid-2x` | `16px` |
| `$grid-3x` | `24px` |
| `$grid-4x` | `32px` |
| `$grid-5x` | `40px` |
| `$grid-6x` | `48px` |
| `$small-width` | `540px` |
| `$medium-width` | `720px` |

Modules import via: `@use '@/styles/globals' as *;`

### Gap vs Figma Design

| Concern | Current | Figma Target |
|---|---|---|
| Color palette | Dark green accent `#0A6847`, teal/gray palette | Green Tailwind scale (`#16a34a` primary, full `--green-*` / `--gray-*` range) |
| Font stack | `Playfair Display` headings, `DM Sans` body | System sans-serif: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto` |
| Token names | Semantic only (`--color-accent`, `--color-warn`) | Full scale tokens (`--green-600`, `--gray-200`, etc.) |

See `design-tokens.md` for the full Figma target palette.
