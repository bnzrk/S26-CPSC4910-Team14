import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiFetch';
import { usePoints, usePointHistory } from '../../api/points';
import { useDriverOrg } from '@/api/driver';
import Card from '@/components/Card/Card';
import PointCard from '@/components/PointCard/PointCard';
import CardHost from '@/components/CardHost/CardHost';
import InlineErrors from '@/components/InlineErrors/InlineErrors';
import InlineInfo from '@/components/InlineInfo/InlineInfo';
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

export default function PointsPage()
{
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const {
    data: totalPoints,
    isLoading: totalLoading,
    isError: totalError,
    refetch: refetchTotal,
  } = usePoints();

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = usePointHistory(page, pageSize);

  const { data: org, isLoading: isOrgLoading, isError: isOrgError } = useDriverOrg();

  const items = history?.items ?? [];
  const totalCount =
    history?.totalCount ?? 0;

  const totalPages = useMemo(() =>
  {
    if (!totalCount) return 1;
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const hasError = totalError || historyError;

  return (
    <main className={styles.page}>
      <CardHost title={'Points'} subtitle={'Point balance and history'}>
        <PointCard points={totalPoints}></PointCard>
        {hasError && (
          <InlineErrors errors={['Something went wrong loading your points.']}></InlineErrors>
        )}
        {org && <InlineInfo type='info' messages={[`Points are equivalent to $${org?.pointRatio} USD when purchasing from this sponsor's catalog.`]} />}
        <Card title="Point History" headerRight={
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
        }>
          {historyLoading ? (
            <p className={styles.muted}>Loading history…</p>
          ) : items.length === 0 ? (
            <p className={styles.muted}>No point history yet.</p>
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
                              )
                          }
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