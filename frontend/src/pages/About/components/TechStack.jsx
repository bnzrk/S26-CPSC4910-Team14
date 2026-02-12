import { useScrollReveal } from '../hooks/useScrollReveal';
import styles from './TechStack.module.scss';

function groupByCategory(items) {
  const groups = {};
  for (const item of items) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }
  return groups;
}

export default function TechStack({ techStack }) {
  const [ref, isVisible] = useScrollReveal(0.15);
  const grouped = groupByCategory(techStack);

  return (
    <section ref={ref} className={`${styles.section} ${isVisible ? styles.visible : ''}`}>
      <h2 className={styles.heading}>Tech Stack</h2>
      <div className={styles.categories}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className={styles.category}>
            <h3 className={styles.categoryLabel}>{category}</h3>
            <div className={styles.chips}>
              {items.map((item) => (
                <span key={item.name} className={styles.chip}>
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
