import { useNavigate } from 'react-router-dom';
import { usePointRules } from '@/api/pointRules';
import styles from './PointRulesSection.module.scss';

const CATEGORY_CONFIG = {
  Delivery: { color: 'var(--blue-500)', bg: 'var(--blue-100)' },
  Performance: { color: 'var(--color-accent)', bg: 'var(--green-100)' },
  Special: { color: 'var(--amber-500)', bg: 'var(--amber-100)' },
};

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] ?? { color: 'var(--gray-500)', bg: 'var(--gray-100)' };
}

export default function PointRulesSection() {
  const navigate = useNavigate();
  const { data: rules = [] } = usePointRules();

  const grouped = rules.reduce((acc, rule) => {
    const cat = rule.category ?? 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(rule);
    return acc;
  }, {});

  const activeCount = rules.length;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Point Rules</h3>
          <p className={styles.subtitle}>{activeCount} active rules · auto-awarded on trigger</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.importBtn} onClick={() => navigate('/org/point-rules')}>
            Manage Rules
          </button>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className={styles.empty}>
          No point rules configured yet.{' '}
          <button className={styles.emptyLink} onClick={() => navigate('/org/point-rules')}>
            Add your first rule →
          </button>
        </div>
      ) : (
        <div className={styles.column}>
          {Object.entries(grouped).map(([category, catRules]) => {
            const cfg = getCategoryConfig(category);
            return (
              <div key={category} className={styles.column}>
                <div className={styles.catHeader}>
                  <span className={styles.catBadge} style={{ background: cfg.bg, color: cfg.color }}>
                    {category}
                  </span>
                  <span className={styles.catCount}>{catRules.length} Active rules</span>
                </div>
                <div className={styles.ruleList}>
                  {catRules.map(rule => (
                    <div key={rule.id} className={styles.ruleRow}>
                      <div className={styles.ruleInfo}>
                        <span className={styles.ruleName}>{rule.reason}</span>
                        <span className={styles.ruleTrigger}>On trigger: {rule.reason}</span>
                      </div>
                      <span
                        className={styles.ptsBadge}
                        style={{
                          background: rule.balanceChange >= 0 ? 'var(--green-100)' : 'var(--red-100)',
                          color: rule.balanceChange >= 0 ? 'var(--green-700)' : 'var(--red-500)',
                        }}
                      >
                        {rule.balanceChange >= 0 ? '+' : ''}{rule.balanceChange} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
