import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/apiFetch';
import { useCurrentUser } from '@/api/currentUser';
import { useAvailableSponsorOrgs } from '@/api/sponsorOrg';
import { queryClient } from '@/api/queryClient';
import { USER_TYPES } from '@/constants/userTypes';
import PageControls from '@/components/PageControls/PageControls';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import styles from './AuditLogPage.module.scss';

const PAGE_SIZE = 10;

const LOG_TYPES = [
  { key: 'logins', label: 'Logins' },
  { key: 'point-transactions', label: 'Point Transactions' },
  { key: 'driver-sponsor-changes', label: 'Driver/Sponsor Changes' },
  { key: 'password-changes', label: 'Password Changes' },
  { key: 'application-status-changes', label: 'Application Changes' },
  { key: 'catalog-changes', label: 'Catalog Changes' },
];

async function fetchLogs(type, filters, page = 1, pageSize = 5)
{
  const params = new URLSearchParams();
  if (filters.email) params.set('email', filters.email);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sponsorOrgId) params.set('sponsorOrgId', filters.sponsorOrgId);
  params.set('page', page);
  params.set('pageSize', pageSize);

  const response = await apiFetch(`/audit-logs/${type}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch audit logs');
  return response.json();
}

function buildCSV(logs, type)
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

async function exportToCSV(type, filters, totalCount)
{
  const result = await queryClient.fetchQuery({
    queryKey: ['auditLogs', type, filters, 1, totalCount],
    queryFn: () => fetchLogs(type, filters, 1, totalCount),
    staleTime: 0,
    gcTime: 0,
  });

  const logs = result?.items ?? [];
  if (!logs || logs.length === 0)
    throw new Error('No logs to export.');

  buildCSV(logs, type);
}

export default function AuditLogPage()
{
  const [activeType, setActiveType] = useState('logins');
  const [filters, setFilters] = useState({ email: '', from: '', to: '', sponsorOrgId: '' });
  const [appliedFilters, setAppliedFilters] = useState({ email: '', from: '', to: '', sponsorOrgId: '' });
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = PAGE_SIZE;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['auditLogs', activeType, appliedFilters, page],
    queryFn: () => fetchLogs(activeType, appliedFilters, page, pageSize),
    keepPreviousData: true,
  });

  const logs = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  function handleApplyFilters()
  {
    setAppliedFilters({ ...filters });
    setPage(1);
  }

  function handleClearFilters()
  {
    setFilters({ email: '', from: '', to: '', sponsorOrgId: '' });
    setAppliedFilters({ email: '', from: '', to: '', sponsorOrgId: '' });
    setPage(1);
  }

  async function handleExport()
  {
    setIsExporting(true);
    try
    {
      await exportToCSV(activeType, appliedFilters, totalCount);
    }
    catch (ex)
    {
      console.error('Export failed:', ex.message);
    }
    finally
    {
      setIsExporting(false);
    }
  }

  function formatDate(dateStr)
  {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  }

  const { data: availableOrgs, isLoading: isOrgsLoading, isError: isOrgsError } = useAvailableSponsorOrgs();
  const { data: user } = useCurrentUser();
  const isSponsor = user?.userType === USER_TYPES.SPONSOR;

  const showSponsorFilter = !isSponsor && (activeType === 'point-transactions' || activeType === 'driver-sponsor-changes');

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
                <label className={styles.filterLabel}>Sponsor Org</label>
                <select
                  className={styles.orgSelect}
                  value={filters.sponsorOrgId}
                  onChange={e => setFilters(f => ({ ...f, sponsorOrgId: e.target.value }))}
                  disabled={isOrgsLoading || isOrgsError}
                >
                  <option key={-1} value={''}>All</option>
                  {availableOrgs && availableOrgs.length > 0 && availableOrgs.map((org) =>
                    <option key={org.id} value={org.id}>{org.name}</option>
                  )}
                </select>
              </div>
            )}
            <div className={styles.filterActions}>
              <button className={styles.btnPrimary} onClick={handleApplyFilters}>Apply</button>
              <button className={styles.btnSecondary} onClick={handleClearFilters}>Clear</button>
              <button
                className={styles.btnExport}
                onClick={handleExport}
                disabled={isExporting || !logs || logs.length === 0}
              >
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card title={`${LOG_TYPES.find(t => t.key === activeType)?.label} (${totalCount})`}>
          {isLoading && <p className={styles.muted}>Loading...</p>}
          {isError && <p className={styles.error}>Failed to load logs.</p>}

          {logs && logs.length === 0 && (
            <p className={styles.muted}>No logs found.</p>
          )}

          <PageControls
            page={page}
            totalPages={totalPages}
            onNext={() => setPage(p => Math.min(p + 1, totalPages))}
            onPrev={() => setPage(p => Math.max(p - 1, 1))}
            onStart={() => setPage(1)}
            onEnd={() => setPage(totalPages)}
            showBookends={true}
          >
            {logs && logs.length > 0 && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {Object.keys(logs[0]).map(key => (
                        <th key={`h_${key}`}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={i}>
                        {Object.entries(log).map(([key, val]) => (
                          <td key={`d_${key}`}>
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
          </PageControls>
        </Card>

      </CardHost>
    </main>
  );
}