import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './FleetChart.module.scss';
import clsx from 'clsx';

const TABS = ['Points', 'Deliveries', 'Spend'];

const DATA = {
  Points: [
    { month: 'Sep', value: 28400 },
    { month: 'Oct', value: 32100 },
    { month: 'Nov', value: 35600 },
    { month: 'Dec', value: 30200 },
    { month: 'Jan', value: 39600 },
    { month: 'Feb', value: 48200 },
  ],
  Deliveries: [
    { month: 'Sep', value: 180 },
    { month: 'Oct', value: 210 },
    { month: 'Nov', value: 195 },
    { month: 'Dec', value: 175 },
    { month: 'Jan', value: 230 },
    { month: 'Feb', value: 284 },
  ],
  Spend: [
    { month: 'Sep', value: 2100 },
    { month: 'Oct', value: 2400 },
    { month: 'Nov', value: 2800 },
    { month: 'Dec', value: 2200 },
    { month: 'Jan', value: 3100 },
    { month: 'Feb', value: 3840 },
  ],
};

const SUMMARIES = {
  Points: [
    { label: 'THIS MONTH', value: '48,200 pts' },
    { label: 'PREV MONTH', value: '39,600 pts' },
    { label: '6-MO AVG', value: '33,800 pts' },
    { label: 'ENGAGEMENT', value: '94%' },
  ],
  Deliveries: [
    { label: 'THIS MONTH', value: '284' },
    { label: 'PREV MONTH', value: '230' },
    { label: '6-MO AVG', value: '212' },
    { label: 'ON-TIME', value: '94%' },
  ],
  Spend: [
    { label: 'THIS MONTH', value: '$3,840' },
    { label: 'PREV MONTH', value: '$3,100' },
    { label: '6-MO AVG', value: '$2,740' },
    { label: 'BUDGET USED', value: '77%' },
  ],
};

function formatYAxis(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value;
}

export default function FleetChart() {
  const [activeTab, setActiveTab] = useState('Points');
  const data = DATA[activeTab];
  const summaries = SUMMARIES[activeTab];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Fleet Points &amp; Deliveries</h3>
          <p className={styles.subtitle}>Monthly activity across all 32 drivers</p>
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
