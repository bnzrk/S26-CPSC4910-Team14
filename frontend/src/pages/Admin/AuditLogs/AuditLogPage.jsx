import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/apiFetch';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import styles from './AuditLogPage.module.scss';

const LOG_TYPES = [
  { key: 'logins', label: 'Logins' },
  { key: 'point-transactions', label: 'Point Transactions' },
  { key: 'driver-sponsor-changes', label: 'Driver/Sponsor Changes' },
  { key: 'password-changes', label: 'Password Changes' },
  { key: 'application-status-changes', label: 'Application Changes' },
  { key: 'catalog-changes', label: 'Catalog Changes' },
];

async function fetchLogs(type, filters)
{
  const params = new URLSearchParams();
  if (filters.email) params.set('email', filters.email);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sponsorOrgId) params.set('sponsorOrgId', filters.sponsorOrgId);

  const response = await apiFetch(`/audit-logs/${type}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch audit logs');
  return response.json();
}

function exportToCSV(logs, type)
{
  if (!logs || logs.length === 0) return;

  const headers = Object.keys(logs[0]);
  const rows = logs.map(log => headers.map(h => JSON.stringify(log[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${type}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditLogPage()
{
  const [activeType, setActiveType] = useState('logins');
  const [filters, setFilters] = useState({ email: '', from: '', to: '', sponsorOrgId: '' });
  const [appliedFilters, setAppliedFilters] = useState({ email: '', from: '', to: '', sponsorOrgId: '' });

  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['auditLogs', activeType, appliedFilters],
    queryFn: () => fetchLogs(activeType, appliedFilters),
  });

  function handleApplyFilters()
  {
    setAppliedFilters({ ...filters });
  }

  function handleClearFilters()
  {
    setFilters({ email: '', from: '', to: '', sponsorOrgId: '' });
    setAppliedFilters({ email: '', from: '', to: '', sponsorOrgId: '' });
  }

  function formatDate(dateStr)
  {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  }

  const showSponsorFilter = activeType === 'point-transactions' || activeType === 'driver-sponsor-changes';

  return (
    <main>
      <CardHost title="Audit Logs" subtitle="View and search system audit logs">

        {/* Log Type Tabs */}
        <div className={styles.tabs}>
          {LOG_TYPES.map(t => (
            <button
              key={t.key}
              className={`${styles.tab} ${activeType === t.key ? styles.tabActive : ''}`}
              onClick={() => setActiveType(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card title="Filters">
          <div className={styles.filters}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Search by email</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="user@example.com"
                value={filters.email}
                onChange={e => setFilters(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>From date</label>
              <input
                type="date"
                className={styles.filterInput}
                value={filters.from}
                onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>To date</label>
              <input
                type="date"
                className={styles.filterInput}
                value={filters.to}
                onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
              />
            </div>
            {showSponsorFilter && (
              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Sponsor Org ID</label>
                <input
                  type="number"
                  className={styles.filterInput}
                  placeholder="e.g. 1"
                  value={filters.sponsorOrgId}
                  onChange={e => setFilters(f => ({ ...f, sponsorOrgId: e.target.value }))}
                />
              </div>
            )}
            <div className={styles.filterActions}>
              <button className={styles.btnPrimary} onClick={handleApplyFilters}>Apply</button>
              <button className={styles.btnSecondary} onClick={handleClearFilters}>Clear</button>
              <button
                className={styles.btnExport}
                onClick={() => exportToCSV(logs, activeType)}
                disabled={!logs || logs.length === 0}
              >
                Export CSV
              </button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card title={`${LOG_TYPES.find(t => t.key === activeType)?.label} (${logs?.length ?? 0})`}>
          {isLoading && <p className={styles.muted}>Loading...</p>}
          {isError && <p className={styles.error}>Failed to load logs.</p>}

          {logs && logs.length === 0 && (
            <p className={styles.muted}>No logs found.</p>
          )}

          {logs && logs.length > 0 && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(logs[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      {Object.entries(log).map(([key, val]) => (
                        <td key={key}>
                          {typeof val === 'boolean'
                            ? val ? '✓' : '✗'
                            : key === 'timestampUtc'
                              ? formatDate(val)
                              : String(val ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </CardHost>
    </main>
  );
}