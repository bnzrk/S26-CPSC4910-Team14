import { Trophy, Store, BarChart3, ShieldCheck } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import styles from './FeatureCards.module.scss';

const iconMap = {
  trophy: Trophy,
  store: Store,
  'bar-chart-3': BarChart3,
  'shield-check': ShieldCheck,
};

export default function FeatureCards({ features }) {
  const [ref, isVisible] = useScrollReveal(0.1);

  return (
    <section ref={ref} className={styles.section}>
      <h2 className={styles.heading}>Platform Features</h2>
      <div className={styles.grid}>
        {features.map((feature, i) => {
          const Icon = iconMap[feature.icon];
          return (
            <div
              key={feature.title}
              className={`${styles.card} ${isVisible ? styles.visible : ''}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={styles.iconWrap}>
                {Icon && <Icon size={24} />}
              </div>
              <h3 className={styles.title}>{feature.title}</h3>
              <p className={styles.description}>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
