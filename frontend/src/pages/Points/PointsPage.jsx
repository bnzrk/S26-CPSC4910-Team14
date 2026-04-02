import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoints, usePointHistory } from '../../api/points';
import { useDriverOrgs } from '@/api/driver';
import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import Card from '@/components/Card/Card';
import PointCard from '@/components/PointCard/PointCard';
import CardHost from '@/components/CardHost/CardHost';
import InlineErrors from '@/components/InlineErrors/InlineErrors';
import InlineInfo from '@/components/InlineInfo/InlineInfo';
import Button from '@/components/Button/Button';
import Avatar from '@/components/Avatar/Avatar';
import styles from './PointsPage.module.scss';
import clsx from 'clsx';

function formatDMY(dateLike)
{
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate());
  const month = String(d.getMonth() + 1);
  const year = String(d.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

function normalizeDateTimeLocal(value)
{
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}

function getOrgInitials(name)
{
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function formatPointDollarValue(val)
{
  if (val == null) return '$0.01';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val);
}

export default function PointsPage()
{
  const navigate = useNavigate();
  const { selectedOrgId } = useOrgContext();
  const { data: orgs } = useDriverOrgs();

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [sign, setSign] = useState(undefined);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const selectedOrg = useMemo(() =>
    (orgs ?? []).find(o => String(o.id) === String(selectedOrgId)) ?? null,
    [orgs, selectedOrgId]
  );

  const {
    data: points,
    isLoading: pointsLoading,
    isError: pointsError,
  } = usePoints(selectedOrgId);

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
  } = usePointHistory({
    orgId: selectedOrgId,
    page,
    pageSize,
    sign,
    from: normalizeDateTimeLocal(from),
    to: normalizeDateTimeLocal(to),
  });

  const totalPages = history ? Math.max(1, Math.ceil(history.total / pageSize)) : 1;

  const pointBalance = points?.balance ?? 0;
  const dollarValue = selectedOrg?.pointDollarValue ?? 0.01;
  const estimatedDollarBalance = (pointBalance * dollarValue).toFixed(2);

  return (
    <CardHost title="My Points" subtitle={selectedOrg?.sponsorName ?? 'Select an organization'}>
      {!selectedOrgId && (
        <InlineInfo variant="info">
          Select a sponsor organization from the sidebar to view your points.
        </InlineInfo>
      )}

      {selectedOrgId && (
        <>
          {/* ── Point Balance Card ── */}
          <Card title="Point Balance" icon={null}>
            <div className={styles.balanceSection}>
              {pointsLoading && <p className={styles.loading}>Loading balance…</p>}
              {pointsError && <InlineErrors messages={['Failed to load points.']} />}
              {!pointsLoading && !pointsError && (
                <div className={styles.balanceDisplay}>
                  <span className={styles.balancePoints}>
                    {pointBalance.toLocaleString()} pts
                  </span>
                  <span className={styles.balanceDollar}>
                    ≈ ${estimatedDollarBalance} USD
                  </span>
                  <p className={styles.balanceNote}>
                    Point value: {formatPointDollarValue(dollarValue)} / pt
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* ── Sponsor Info Card ── */}
          {selectedOrg && (
            <Card title="Your Sponsor">
              <div className={styles.sponsorCard}>
                <Avatar initials={getOrgInitials(selectedOrg.sponsorName)} size="lg" />
                <div className={styles.sponsorDetails}>
                  <p className={styles.sponsorName}>{selectedOrg.sponsorName}</p>
                  <p className={styles.sponsorMeta}>
                    Member since {selectedOrg.joinDate ? formatDMY(selectedOrg.joinDate) : '—'}
                  </p>
                  <p className={styles.sponsorMeta}>
                    Point value: {formatPointDollarValue(selectedOrg.pointDollarValue)}
                  </p>
                  {selectedOrg.status && (
                    <span className={clsx(
                      styles.statusBadge,
                      selectedOrg.status === 'Active' ? styles.statusActive : styles.statusInactive
                    )}>
                      {selectedOrg.status}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* ── Point History ── */}
          <Card
            title="Point History"
            headerRight={
              <div className={styles.filterRow}>
                <select
                  className={styles.filterSelect}
                  value={sign ?? ''}
                  onChange={e => { setSign(e.target.value || undefined); setPage(1); }}
                >
                  <option value="">All</option>
                  <option value="positive">Earned</option>
                  <option value="negative">Spent</option>
                </select>
                <input
                  type="datetime-local"
                  className={styles.filterDate}
                  value={from}
                  onChange={e => { setFrom(e.target.value); setPage(1); }}
                />
                <span className={styles.dateSep}>→</span>
                <input
                  type="datetime-local"
                  className={styles.filterDate}
                  value={to}
                  onChange={e => { setTo(e.target.value); setPage(1); }}
                />
              </div>
            }
          >
            {historyLoading && <p className={styles.loading}>Loading history…</p>}
            {historyError && <InlineErrors messages={['Failed to load history.']} />}
            {!historyLoading && !historyError && (
              <>
                {(!history?.items || history.items.length === 0) && (
                  <p className={styles.empty}>No transactions found.</p>
                )}
                {history?.items?.length > 0 && (
                  <table className={styles.historyTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Reason</th>
                        <th className={styles.alignRight}>Change</th>
                        <th className={styles.alignRight}>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.items.map((t, i) => (
                        <tr key={t.id ?? i}>
                          <td>{formatDMY(t.createdAt)}</td>
                          <td>{t.reason ?? '—'}</td>
                          <td className={clsx(
                            styles.alignRight,
                            Number(t.balanceChange) > 0 ? styles.positive : styles.negative
                          )}>
                            {Number(t.balanceChange) > 0 ? '+' : ''}{Number(t.balanceChange).toLocaleString()}
                          </td>
                          <td className={styles.alignRight}>{Number(t.newBalance).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Pagination */}
                <div className={styles.pager}>
                  <Button
                    text="← Prev"
                    color="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  />
                  <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                  <Button
                    text="Next →"
                    color="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  />
                </div>
              </>
            )}
          </Card>
        </>
      )}
    </CardHost>
  );
}