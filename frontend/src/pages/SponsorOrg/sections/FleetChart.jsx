import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './FleetChart.module.scss';
import clsx from 'clsx';

const TABS = ['Points', 'Spend'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_DELIVERIES_DATA = [
  { month: 'Sep', value: 180 },
  { month: 'Oct', value: 210 },
  { month: 'Nov', value: 195 },
  { month: 'Dec', value: 175 },
  { month: 'Jan', value: 230 },
  { month: 'Feb', value: 284 },
];

const DEFAULT_DELIVERIES_SUMMARY = [
  { label: 'THIS MONTH', value: '284' },
  { label: 'PREV MONTH', value: '230' },
  { label: '6-MO AVG', value: '212' },
  { label: 'ON-TIME', value: '94%' },
];

function getPointsData(summary) {
  if (!summary?.length) return [];
  return summary.map(s => ({
    month: MONTH_NAMES[s.month - 1],
    value: s.points,
  }));
}

function getSpendData(summary) {
  if (!summary?.length) return [];
  return summary.map(s => ({
    month: MONTH_NAMES[s.month - 1],
    value: s.expensesUsd,
  }));
}

function getPointsSummary(summary) {
  if (!summary?.length) return [];
  const thisMonth = summary.at(-1)?.points ?? 0;
  const prevMonth = summary.at(-2)?.points ?? 0;
  const avg = Math.round(summary.reduce((sum, s) => sum + s.points, 0) / summary.length);
  return [
    { label: 'THIS MONTH', value: `${thisMonth.toLocaleString()} pts` },
    { label: 'PREV MONTH', value: `${prevMonth.toLocaleString()} pts` },
    { label: '6-MO AVG', value: `${avg.toLocaleString()} pts` },
    // { label: 'ENGAGEMENT', value: '—%' },
  ];
}

function getSpendSummary(summary, budgetUsedPercent = 0) {
  if (!summary?.length) return [];
  const thisMonth = summary.at(-1)?.expensesUsd ?? 0;
  const prevMonth = summary.at(-2)?.expensesUsd ?? 0;
  const avg = (summary.reduce((sum, s) => sum + s.expensesUsd, 0) / summary.length).toFixed(2);
  return [
    { label: 'THIS MONTH', value: `$${thisMonth.toLocaleString()}` },
    { label: 'PREV MONTH', value: `$${prevMonth.toLocaleString()}` },
    { label: '6-MO AVG', value: `$${avg}` },
    { label: 'BUDGET USED', value: `${budgetUsedPercent}%` },
  ];
}

function getData(tab, summary) {
  switch (tab) {
    case 'Points':     return getPointsData(summary);
    case 'Spend':      return getSpendData(summary);
    case 'Deliveries': return DEFAULT_DELIVERIES_DATA;
  }
}

function getSummaries(tab, summary, budgetUsedPercent) {
  switch (tab) {
    case 'Points':     return getPointsSummary(summary);
    case 'Spend':      return getSpendSummary(summary, budgetUsedPercent);
    case 'Deliveries': return DEFAULT_DELIVERIES_SUMMARY;
  }
}

function formatYAxis(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value;
}

export default function FleetChart({ driverCount = 0, summary, budgetUsedPercent = 0 }) {
  const [activeTab, setActiveTab] = useState('Points');

  const data = getData(activeTab, summary);
  const summaries = getSummaries(activeTab, summary, budgetUsedPercent);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Fleet Points &amp; Spending</h3>
          <p className={styles.subtitle}>Monthly activity across all {driverCount} drivers</p>
        </div>
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={clsx(styles.tab, activeTab === tab && styles.tabActive)}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.summaryRow}>
        {summaries.map(s => (
          <div key={s.label} className={styles.summaryChip}>
            <span className={styles.chipLabel}>{s.label}</span>
            <span className={styles.chipValue}>{s.value}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip
              contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: 'var(--green-50)' }}
            />
            <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}