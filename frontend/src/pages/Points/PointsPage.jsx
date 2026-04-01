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

export default function PointsPage()
{
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Filters
  const [sign, setSign] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const from = fromDate ? `${fromDate}T00:00:00` : undefined;
  const to = toDate ? `${toDate}T23:59:59` : undefined;

  const { selectedOrgId } = useOrgContext();
  const {
    data: points,
    isError: isPointsError,
  } = usePoints(selectedOrgId);

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
  } = usePointHistory({
    orgId: selectedOrgId,
    page,
    pageSize,
    sign: sign || undefined,
    from,
    to,
  });

  const { data: orgs } = useDriverOrgs();
  const org = orgs ? orgs.find((o) => o.id == selectedOrgId) : null;

  const items = history?.items ?? [];
  const totalCount = history?.totalCount ?? 0;

  const totalPages = useMemo(() =>
  {
    if (!totalCount) return 1;
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const hasError = isPointsError || historyError;

  const clearFilters = () =>
  {
    setSign('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  return (
    <main className={styles.page}>
      <CardHost>
        <Button color="primary" onClick={() => navigate('/driver-application')}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          + Apply to a Sponsor
        </Button>
        <PointCard points={points ? points.balance : 0}></PointCard>

        {hasError && (
          <InlineErrors errors={['Something went wrong loading your points.']}></InlineErrors>
        )}

        {org && (
          <InlineInfo
            type='info'
            messages={[`Points are equivalent to $${org?.pointRatio} USD when purchasing from this sponsor's catalog.`]}
          />
        )}

        <Card
          title="Point History"
          headerRight={
            <div className={styles.pager}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev || historyLoading}
              >
                Prev
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext || historyLoading}
              >
                Next
              </button>
            </div>
          }
        >
          {/* Filters */}
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="points-sign">Type</label>
              <select
                id="points-sign"
                className={styles.filterControl}
                value={sign}
                onChange={(e) =>
                {
                  setSign(e.target.value);
                  setPage(1);
                }}
                disabled={historyLoading}
              >
                <option value="">All</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="points-from">From</label>
              <input
                id="points-from"
                className={styles.filterControl}
                type="date"
                value={fromDate}
                onChange={(e) =>
                {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                disabled={historyLoading}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="points-to">To</label>
              <input
                id="points-to"
                className={styles.filterControl}
                type="date"
                value={toDate}
                onChange={(e) =>
                {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                disabled={historyLoading}
              />
            </div>

            <button
              type="button"
              className={styles.filterClear}
              onClick={clearFilters}
              disabled={historyLoading || (!sign && !fromDate && !toDate)}
              aria-label="Clear filters"
            >
              Clear
            </button>
          </div>

          {historyLoading ? (
            <p className={styles.muted}>Loading history…</p>
          ) : items.length === 0 ? (
            <p className={styles.muted}>No point history.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reason</th>
                    <th className={styles.balance}>Change</th>
                    <th className={styles.date}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) =>
                  {
                    const change = Number(t.balanceChange ?? 0);
                    const isPositive = change > 0;
                    const isNegative = change < 0;
                    return (
                      <tr key={t.id}>
                        <td>{t.reason}</td>
                        <td
                          className={clsx(
                            isPositive
                              ? styles.positive
                              : isNegative
                                ? styles.negative
                                : undefined,
                            styles.balance
                          )}
                        >
                          {isPositive ? `+${change}` : `${change}`}
                        </td>
                        <td className={styles.date}>{formatDMY(t.transactionDateUtc)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.footerMeta}>
            <span className={styles.muted}>
              Showing {items.length} of {totalCount || items.length}
            </span>
          </div>
        </Card>
      </CardHost>
    </main>
  );
}