import { useScrollReveal } from '../hooks/useScrollReveal';
import styles from './TeamSection.module.scss';

const avatarColors = ['#0A6847', '#2563EB', '#9333EA', '#DC2626', '#D97706'];

function getInitials(firstName, lastName) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export default function TeamSection({ teamMembers }) {
  const [ref, isVisible] = useScrollReveal(0.1);

  return (
    <section ref={ref} className={styles.section}>
      <h2 className={styles.heading}>Meet the Team</h2>
      <div className={styles.grid}>
        {teamMembers.map((member, i) => (
          <div
            key={`${member.firstName}-${member.lastName}`}
            className={`${styles.card} ${isVisible ? styles.visible : ''}`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div
              className={styles.avatar}
              style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
            >
              {getInitials(member.firstName, member.lastName)}
            </div>
            <span className={styles.name}>
              {member.firstName} {member.lastName}
            </span>
            <span className={styles.role}>{member.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
