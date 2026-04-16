/**
 * Driver Dashboard — Widget → Endpoint Audit (Phase 1)
 *
 * Widgets with available backend endpoints (live data wired):
 *
 * @widget DashStatCard 1 — Total Points
 * @endpoint GET /drivers/me/points/{orgId}
 * @fields balance
 * @status Live — trend removed (no comparison data)
 *
 * @widget DashStatCard 2 — Transactions This Month
 * @endpoint GET /drivers/me/point-transactions?sign=+&from=<ISO start-of-month>&pageSize=1
 * @fields totalCount
 * @status Live — formerly "Deliveries This Month" with hardcoded 47
 *
 * @widget DashStatCard 3 — Orders Placed
 * @endpoint GET /orders?orgId=X&pageSize=1
 * @fields totalCount
 * @status Live — formerly "Fleet Rank" with hardcoded #3
 *
 * @widget DashStatCard 4 — Pending Alerts
 * @endpoint GET /alerts
 * @fields alerts.length
 * @status Live — formerly "On-Time Rate" with hardcoded 96%
 *
 * @widget PointsChart
 * @endpoint GET /drivers/me/point-transactions (via history prop)
 * @fields items[].transactionDateUtc, items[].balanceChange
 * @status Live — removed MOCK_MONTHLY fallback; loader + empty state added
 *
 * @widget RecentDeliveriesTable
 * @endpoint GET /drivers/me/point-transactions (via history prop)
 * @fields items[].reason, items[].transactionDateUtc, items[].balanceChange
 * @status Live — removed MOCK_DELIVERIES fallback; skeleton + empty state added
 *
 * @widget ActivityFeed
 * @endpoint GET /drivers/me/point-transactions (via history prop)
 * @fields items[].reason, items[].transactionDateUtc, items[].balanceChange
 * @status Live — removed MOCK_FEED fallback; skeleton + empty state added
 *
 * @widget RedeemRewards
 * @endpoint GET /sponsor-orgs/{orgId}/catalog
 * @fields items[].title, items[].catalogPrice, items[].images[0], items[].isAvailable
 * @status Live — removed MOCK_REWARDS; loading/error/empty states added
 *
 * ---
 *
 * Widgets with NO backend support (remain as mock/static):
 *
 * @widget NextDelivery
 * @missing GET /drivers/me/upcoming-delivery (no delivery scheduling system)
 *
 * @widget MonthlyGoal
 * @missing GET /drivers/me/goals/{orgId} (no goal tracking; currentPoints is live)
 *
 * @widget DeliveryStreak
 * @missing GET /drivers/me/streak (no streak tracking)
 *
 * @widget FleetLeaderboard
 * @missing GET /sponsor-orgs/{orgId}/top-drivers (stub exists in sponsorOrg.js but endpoint not in backend)
 *
 * @widget ActiveChallenges
 * @missing GET /drivers/me/challenges (no challenges system)
 */
