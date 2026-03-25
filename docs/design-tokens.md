# Design Tokens

Extracted from three Figma HTML prototypes:
- `drivepoints.html` — About/landing page
- `drivepoints-dashboard.html` — Driver Dashboard
- `drivepoints-sponsor.html` — Sponsor Dashboard

---

## Color Palette

### Green (brand primary)

| Token | Hex | Notes |
|---|---|---|
| `--green-900` | `#0a3d1f` | Driver sidebar bg, hero gradient start |
| `--green-800` | `#0f5c2e` | Gradient mid, upcoming card |
| `--green-700` | `#166534` | Active nav bg (driver), hover |
| `--green-600` | `#16a34a` | Primary CTA, badges, pts text |
| `--green-500` | `#22c55e` | Chart bars, progress fill |
| `--green-400` | `#4ade80` | Accent, avatar gradient, sponsor active |
| `--green-200` | `#bbf7d0` | Chart bar default |
| `--green-100` | `#dcfce7` | Tinted surfaces, icon bg |
| `--green-50`  | `#f0fdf4` | Hover bg, alert bg |

### Gray (neutral)

| Token | Hex | Notes |
|---|---|---|
| `--gray-900` | `#0f172a` | Body text, sponsor sidebar bg, footer bg |
| `--gray-800` | `#1e293b` | — |
| `--gray-700` | `#334155` | — |
| `--gray-600` | `#475569` | Secondary text, icon buttons |
| `--gray-500` | `#64748b` | Muted text, card sub |
| `--gray-400` | `#94a3b8` | Placeholder, timestamps |
| `--gray-300` | `#cbd5e1` | Disabled states, border |
| `--gray-200` | `#e2e8f0` | Card borders, dividers |
| `--gray-100` | `#f1f5f9` | Input bg, surface |
| `--gray-50`  | `#f8fafc` | Page background |

### Semantic / Accent

| Token | Hex | Usage |
|---|---|---|
| `--white` | `#ffffff` | Cards, topbar |
| `--amber-500` | `#f59e0b` | Warning, bonus, gold rank |
| `--amber-400` | `#fbbf24` | Gold rank (sponsor) |
| `--amber-100` | `#fef3c7` | Warning tint |
| `--amber-50`  | `#fffbeb` | Warning card bg |
| `--blue-600`  | `#2563eb` | Info (sponsor) |
| `--blue-500`  | `#3b82f6` | Pending status |
| `--blue-100`  | `#dbeafe` | Info tint |
| `--red-500`   | `#ef4444` | Error, negative delta |
| `--red-100`   | `#fee2e2` | Error tint |
| `--purple-500`| `#8b5cf6` | Stat accent (sponsor) |
| `--purple-100`| `#ede9fe` | Purple tint |

### Semantic Roles

| Role | Token |
|---|---|
| Page bg | `--gray-50` |
| Card bg | `--white` |
| Body text | `--gray-900` |
| Secondary text | `--gray-500` |
| Muted / placeholder | `--gray-400` |
| Border default | `--gray-200` |
| Driver sidebar | `--green-900` |
| Sponsor sidebar | `--gray-900` |
| Active nav (driver) | `--green-700` |
| Active nav (sponsor) | `--gray-900` + 3px `--green-500` left bar |

---

## Typography

**Font stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Base size:** `14px` (dashboards), `16px` (about/landing). Line-height: `1.6`.

| Element | Size | Weight | Notes |
|---|---|---|---|
| Hero H1 | `clamp(2.4rem, 5vw, 3.8rem)` | 900 | lh 1.1, ls -1.5px |
| Section H2 | `clamp(1.8rem, 4vw, 2.8rem)` | 900 | ls -1px |
| Role card H3 | `1.5rem` | 800 | — |
| Feature card H4 | `1.1rem` | 700 | — |
| Nav/sidebar logo | `1.15–1.35rem` | 800 | ls -0.4–0.5px |
| Card title | `0.92–0.95rem` | 700 | — |
| Topbar title | `1rem` | 700 | — |
| Stat value (lg) | `1.6–1.75rem` | 900 | ls -1px |
| Points hero | `1.9–3rem` | 900 | — |
| Body / nav link | `0.88–1rem` | 400–500 | — |
| Card subtitle | `0.73–0.78rem` | 400 | `--gray-400` |
| Table header | `0.68–0.7rem` | 700 | uppercase, ls 0.5px |
| Badge / label | `0.78–0.8rem` | 600–700 | uppercase, ls 1px |
| Micro / timestamp | `0.63–0.72rem` | 400–700 | `--gray-400` |

---

## Spacing & Layout

### Fixed Dimensions

| Element | Value |
|---|---|
| Sidebar width | `260px` |
| Dashboard topbar height | `60px` |
| About nav height | `68px` |
| Content padding (dashboard) | `28px 32px` |
| Section padding (about) | `96px 6%` |
| Max content width | `1200px` |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Icons, small wrappers |
| `--radius-md` | `14px` | Cards, inputs, modals |
| `--radius-lg` | `20px` | Hero card, large overlays |
| Pill | `50px` | All buttons, badges |
| Avatar | `50%` | Circle avatars |

### Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.05)` |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,.09)` |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,.12)` |

### Grid Systems

| Context | Columns | Gap |
|---|---|---|
| Dashboard stats | 4–5 col | 14–16px |
| Dashboard 2-col | 2fr 1fr | 18–20px |
| Dashboard 3-col | 1fr 1fr 1fr | 18–20px |
| About hero | 1fr 1fr | 60px |
| About features | 3 col | 28px |
| About roles | 2 col | 40px |
| About testimonials | 3 col | 24px |
| About stats band | 4 col | 32px |
| Footer | 2fr 1fr 1fr 1fr | 48px |

---

## Component Inventory

### Buttons

| Variant | Bg | Text | Shape | Context |
|---|---|---|---|---|
| `.btn-primary` (about) | `--white` | `--green-800` | pill 50px | Hero on dark bg |
| `.btn-outline` | transparent | `--white` | pill, 2px border | Secondary on dark |
| `.btn-white` | `--white` | `--green-800` | pill | CTA section |
| `.btn-ghost` | transparent | `--white` | pill, rgba border | Secondary CTA |
| `.nav-cta` | `--green-600` | `#fff` | pill | Nav "Get Started" |
| `.btn-primary` (dash) | `--green-600` | `#fff` | pill | Topbar actions |
| `.btn-sm.green` | `--green-600` | `#fff` | small pill | Card actions |
| `.btn-sm.outline` | transparent | `--gray-600` | small pill + border | Secondary card |
| `.btn-danger` | `--red-100` | `--red-500` | pill | Delete |
| `.sidebar-redeem-btn` | rgba white | `#fff` | ghost pill | Sidebar |
| `.upcoming-start-btn` | rgba white | `#fff` | ghost pill | Next delivery |

### Navigation

- **About top nav:** sticky, `backdrop-filter: blur(12px)`, `rgba(255,255,255,.92)` bg
- **Dashboard sidebar (driver):** `--green-900`, 260px fixed, driver profile + points card at bottom
- **Dashboard sidebar (sponsor):** `--gray-900`, 260px fixed, company block + budget bar at bottom
- **Dashboard topbar:** `--white`, 60px sticky, search + period selector + icon buttons

### Cards

| Component | Bg | Border | Radius | Notes |
|---|---|---|---|---|
| `.role-card` | `--white` | `--gray-200` | lg | 40px padding, shadow-md |
| `.feat-card` | none | `--gray-200` | lg | Hover lift -4px |
| `.testi-card` | `--white` | `--gray-200` | lg | 32px padding |
| `.card` (dashboard) | `--white` | `--gray-200` | md | header/body separator |
| `.stat-card` | `--white` | `--gray-200` | md | Hover shadow upgrade |
| `.reward-card` | `--white` | `--gray-200` | md | Locked state overlay |
| `.challenge-item` | `--white` | `--gray-200` | md | Progress bar inside |
| `.upcoming-card` | gradient green-800→600 | none | md | White text |
| `.alert-item.warn` | `--amber-50` | `--amber-100` | md | — |
| `.alert-item.info` | `--blue-100` | `#bfdbfe` | md | — |
| `.alert-item.success` | `--green-50` | `--green-200` | md | — |
| `.hero-card` | `rgba(white,.1)` | rgba white | lg | Frosted glass |

### Badges & Chips

| Class | Bg | Text | Notes |
|---|---|---|---|
| `.hero-badge` | `rgba(white,.15)` | `--green-100` | Frosted, uppercase |
| `.badge-sponsor` | `--green-100` | `--green-700` | — |
| `.badge-driver` | `--gray-900` | `--white` | — |
| `.pts-badge` | `--green-600` | `--white` | 0.78rem |
| `.section-label` | none | `--green-600` | Inline uppercase |
| `.stat-delta.up` | `--green-100` | `--green-700` | tiny pill |
| `.stat-delta.down` | `--red-100` | `--red-500` | tiny pill |
| `.status-pill.completed` | `--green-100` | `--green-700` | dot + text |
| `.status-pill.pending` | `--blue-100` | `--blue-500` | dot + text |
| `.status-pill.bonus` | `--amber-100` | `--amber-500` | dot + text |
| `.nav-badge` | `--green-600` / `--amber-500` | `#fff` | count |
| `.chip-active` | `--green-100` | `--green-700` | dot + text |
| `.chip-inactive` | `--gray-100` | `--gray-500` | dot + text |
| `.chip-alert` | `--amber-100` | `--amber-500` | dot + text |

### Inputs & Form Controls

| Component | Style | Notes |
|---|---|---|
| Search (pill) | `--gray-100` bg, `--gray-200` border, pill | 160–180px wide |
| Period select | `--gray-100` bg, `--radius-sm` | Dropdown |
| Icon button | 36px circle, `--gray-100` bg | Bell/user |
| Form input/select/textarea | `--white` bg, `--gray-300` border, `--radius-sm` | Focus: `--green-500` + `0 0 0 3px rgba(34,197,94,.1)` |
| Toggle switch | 36×20px, `--gray-300` → `--green-600` | Rule enable/disable |

### Data Visualization

| Component | Description |
|---|---|
| Bar chart | Flex bars, `--green-200` default / `--green-600` active, hover tooltip |
| Stacked bar chart | Two-color: `--green-500` + `--green-200` |
| Progress ring | SVG circle, `--gray-200` track / `--green-600` fill, `stroke-linecap: round` |
| Progress bar | 6–8px height, `--gray-200` track, `--radius-50px` |
| Leaderboard | Gold `#f59e0b`, silver `--gray-400`, bronze `#cd7c2f` |
| Table | Full-width collapse, `0.7rem` uppercase headers, `--gray-100` borders |
| Activity feed | Icon dot + content + pts, `--gray-100` dividers |
| Streak dots | done=`--green-600`, today=`--green-400+border`, missed=`--gray-200`, future=dashed |

### Modal

- **Overlay:** `rgba(0,0,0,.45)`, centered flex
- **Box:** `--white`, `--radius-lg`, 520px max-width, `--shadow-lg`, `translateY` open animation
- **Header / body / footer** separated by `--gray-100` borders

---

## Icons & Illustrations

**Icon system:** All inline SVG, stroke-based (Feather-style)
- `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`, `fill: none`
- Sizes: 13px (meta), 16–18px (UI), 20–28px (cards/features)
- Containers: `--radius-sm` square or `50%` circle, semantic-colored bg

**App logo:** 36×36 `rx="8"` rect, `#16a34a` fill; white performance-line path; two `#4ade80` circles at base

**Hero pattern:** `linear-gradient(135deg, --green-900, --green-700 55%, --green-500)` + SVG `+` crosshatch `::before` at 4% opacity
