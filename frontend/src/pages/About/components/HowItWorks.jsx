import { UserPlus, Star, ShoppingCart, Package } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import styles from './HowItWorks.module.scss';

const steps = [
  { label: 'Sign Up', icon: UserPlus },
  { label: 'Earn Points', icon: Star },
  { label: 'Browse Catalog', icon: ShoppingCart },
  { label: 'Redeem', icon: Package },
];

export default function HowItWorks() {
  const [ref, isVisible] = useScrollReveal(0.15);

  return (
    <section ref={ref} className={styles.section}>
      <h2 className={styles.heading}>How It Works</h2>
      <div className={styles.flow}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className={`${styles.step} ${isVisible ? styles.visible : ''}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className={styles.circle}>
                <span className={styles.number}>{i + 1}</span>
                <Icon size={20} className={styles.icon} />
              </div>
              <span className={styles.label}>{step.label}</span>
            </div>
          );
        })}
        <div className={`${styles.connector} ${isVisible ? styles.connectorVisible : ''}`} />
      </div>
    </section>
  );
}
