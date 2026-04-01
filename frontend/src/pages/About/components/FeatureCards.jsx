import { Trophy, Store, BarChart3, ShieldCheck, Bell, Star } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import styles from './FeatureCards.module.scss';

const iconMap = {
  trophy: Trophy,
  store: Store,
  'bar-chart-3': BarChart3,
  'shield-check': ShieldCheck,
  bell: Bell,
  star: Star,
};

export default function FeatureCards({ features }) {
  const [ref, isVisible] = useScrollReveal(0.1);

  return (
    <section ref={ref} className={styles.section}>
      <p className={styles.sectionLabel}>Platform Features</p>
      <h2 className={styles.heading}>Everything You Need to Run Rewards</h2>
      <div className={styles.grid}>
        {features.map((feature, i) => {
          const Icon = iconMap[feature.icon] ?? Trophy;
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
