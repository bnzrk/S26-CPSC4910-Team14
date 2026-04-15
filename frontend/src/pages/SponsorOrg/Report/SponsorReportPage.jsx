import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/apiFetch';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import styles from './SponsorReportPage.module.scss';

// Fetch all point transactions for the sponsor's org
async function fetchSponsorTransactions(filters) {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', `${filters.from}T00:00:00`);
  if (filters.to) params.set('to', `${filters.to}T23:59:59`);
  if (filters.sign) params.set('sign', filters.sign);
  params.set('page', '1');
  params.set('pageSize', '100');

  const res = await apiFetch(`/drivers/me/point-transactions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

// Fetch audit logs for the sponsor's org drivers
async function fetchAuditLogs(type, filters) {
  const params = new URLSearchParams();
  if (filters.email) params.set('email', filters.email);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);

  const res = await apiFetch(`/audit-logs/${type}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const AUDIT_TYPES = [
  { key: 'logins', label: 'Login Attempts' },
  { key: 'application-status-changes', label: 'Application Changes' },
  { key: 'password-changes', label: 'Password Changes' },
];

export default function SponsorReportPage() {
  const [txFilters, setTxFilters] = useState({ from: '', to: '', sign: '' });
  const [appliedTxFilters, setAppliedTxFilters] = useState({ from: '', to: '', sign: '' });

  const [auditType, setAuditType] = useState('logins');
  const [auditFilters, setAuditFilters] = useState({ email: '', from: '', to: '' });
  const [appliedAuditFilters, setAppliedAuditFilters] = useState({ email: '', from: '', to: '' });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['sponsorTransactions', appliedTxFilters],
    queryFn: () => fetchSponsorTransactions(appliedTxFilters),
  });

  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ['sponsorAuditLogs', auditType, appliedAuditFilters],
    queryFn: () => fetchAuditLogs(auditType, appliedAuditFilters),
  });

  const transactions = txData?.items ?? [];

  return (
    <main>
      <CardHost title="Reports" subtitle="View point transactions and audit logs for your organization">

        {/* Point Transactions */}
        <Card title="Point Transactions">
          <div className={styles.filters}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Type</label>
              <select
                className={styles.filterInput}
                value={txFilters.sign}
                onChange={e => setTxFilters(f => ({ ...f, sign: e.target.value }))}
              >
                <option value="">All</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>From</label>
              <input
                type="date"
                className={styles.filterInput}
                value={txFilters.from}
                onChange={e => setTxFilters(f => ({ ...f, from: e.target.value }))}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>To</label>
              <input
                type="date"
                className={styles.filterInput}
                value={txFilters.to}
                onChange={e => setTxFilters(f => ({ ...f, to: e.target.value }))}
              />
            </div>
            <div className={styles.filterActions}>
              <button className={styles.btnPrimary} onClick={() => setAppliedTxFilters({ ...txFilters })}>Apply</button>
              <button className={styles.btnSecondary} onClick={() => { setTxFilters({ from: '', to: '', sign: '' }); setAppliedTxFilters({ from: '', to: '', sign: '' }); }}>Clear</button>
              <button className={styles.btnExport} onClick={() => exportToCSV(transactions, 'point-transactions')} disabled={transactions.length === 0}>Export CSV</button>
            </div>
          </div>

          {txLoading ? (
            <p className={styles.muted}>Loading...</p>
          ) : transactions.length === 0 ? (
            <p className={styles.muted}>No transactions found.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reason</th>
                    <th>Change</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td>{t.reason}</td>
                      <td className={t.balanceChange > 0 ? styles.positive : styles.negative}>
                        {t.balanceChange > 0 ? `+${t.balanceChange}` : t.balanceChange}
                      </td>
                      <td>{new Date(t.transactionDateUtc).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Audit Logs */}
        <Card title="Audit Logs">
          <div className={styles.tabs}>
            {AUDIT_TYPES.map(t => (
              <button
                key={t.key}
                className={`${styles.tab} ${auditType === t.key ? styles.tabActive : ''}`}
                onClick={() => setAuditType(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.filters}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Search email</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="user@example.com"
                value={auditFilters.email}
                onChange={e => setAuditFilters(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>From</label>
              <input
                type="date"
                className={styles.filterInput}
                value={auditFilters.from}
                onChange={e => setAuditFilters(f => ({ ...f, from: e.target.value }))}
              />
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>To</label>
              <input
                type="date"
                className={styles.filterInput}
                value={auditFilters.to}
                onChange={e => setAuditFilters(f => ({ ...f, to: e.target.value }))}
              />
            </div>
            <div className={styles.filterActions}>
              <button className={styles.btnPrimary} onClick={() => setAppliedAuditFilters({ ...auditFilters })}>Apply</button>
              <button className={styles.btnSecondary} onClick={() => { setAuditFilters({ email: '', from: '', to: '' }); setAppliedAuditFilters({ email: '', from: '', to: '' }); }}>Clear</button>
              <button className={styles.btnExport} onClick={() => exportToCSV(auditLogs, auditType)} disabled={!auditLogs || auditLogs.length === 0}>Export CSV</button>
            </div>
          </div>

          {auditLoading ? (
            <p className={styles.muted}>Loading...</p>
          ) : !auditLogs || auditLogs.length === 0 ? (
            <p className={styles.muted}>No logs found.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(auditLogs[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id}>
                      {Object.entries(log).map(([key, val]) => (
                        <td key={key}>
                          {typeof val === 'boolean'
                            ? val ? '✓' : '✗'
                            : key === 'timestampUtc'
                              ? new Date(val).toLocaleString()
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