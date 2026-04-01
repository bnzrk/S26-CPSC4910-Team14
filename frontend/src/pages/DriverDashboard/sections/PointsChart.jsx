import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './PointsChart.module.scss';
import clsx from 'clsx';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MOCK_MONTHLY = [
  { month: 'Sep', points: 820 },
  { month: 'Oct', points: 1400 },
  { month: 'Nov', points: 950 },
  { month: 'Dec', points: 1760 },
  { month: 'Jan', points: 1100 },
  { month: 'Feb', points: 1850 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>{payload[0].value.toLocaleString()} pts</div>
    </div>
  );
}

export default function PointsChart({ history }) {
  const [view, setView] = useState('monthly');

  const data = useMemo(() => {
    const items = history?.items ?? [];
    if (!items.length) return MOCK_MONTHLY;

    const byMonth = {};
    items.forEach(t => {
      const d = new Date(t.transactionDateUtc);
      if (isNaN(d.getTime())) return;
      const key = MONTH_NAMES[d.getMonth()];
      byMonth[key] = (byMonth[key] ?? 0) + Math.max(0, Number(t.balanceChange ?? 0));
    });

    return Object.entries(byMonth).map(([month, points]) => ({ month, points }));
  }, [history]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Points Earned</span>
          <span className={styles.subtitle}>Monthly breakdown · 2026</span>
        </div>
        <div className={styles.toggle}>
          <button
            className={clsx(styles.toggleBtn, view === 'monthly' && styles.toggleActive)}
            onClick={() => setView('monthly')}
          >Monthly</button>
          <button
            className={clsx(styles.toggleBtn, view === 'weekly' && styles.toggleActive)}
            onClick={() => setView('weekly')}
          >Weekly</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barSize={28}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--green-50)' }} />
          <Bar dataKey="points" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
