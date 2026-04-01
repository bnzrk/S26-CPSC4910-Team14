import ProgressBar from '@/components/ProgressBar/ProgressBar';
import styles from './ActiveChallenges.module.scss';

const MOCK_CHALLENGES = [
  {
    icon: '⚡',
    iconBg: '#fef3c7',
    title: 'Speed Demon',
    reward: '+500 pts',
    description: 'Complete 10 deliveries under 8 hours average.',
    progress: 0.7,
    progressLabel: '7 / 10 deliveries',
    expires: 'Expires Feb 28',
  },
  {
    icon: '🛡️',
    iconBg: '#dbeafe',
    title: 'Safety Star',
    reward: '+300 pts',
    description: 'Zero safety incidents for 30 consecutive days.',
    progress: 0.8,
    progressLabel: '24 / 30 days',
    expires: 'Expires Mar 5',
  },
  {
    icon: '🗺️',
    iconBg: '#dcfce7',
    title: 'Route Explorer',
    reward: '+200 pts',
    description: 'Complete deliveries in 5 different states.',
    progress: 0.6,
    progressLabel: '3 / 5 states',
    expires: 'Expires Mar 15',
  },
];

export default function ActiveChallenges({ challenges = MOCK_CHALLENGES }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Active Challenges</span>
          <span className={styles.subtitle}>{challenges.length} in progress</span>
        </div>
        <a href="#" className={styles.viewAll}>All →</a>
      </div>

      <div className={styles.list}>
        {challenges.map((c, i) => (
          <div key={i} className={styles.challenge}>
            <div className={styles.challengeTop}>
              <div className={styles.iconCircle} style={{ background: c.iconBg }}>{c.icon}</div>
              <div className={styles.challengeInfo}>
                <div className={styles.challengeTitle}>{c.title}</div>
                <div className={styles.challengeDesc}>{c.description}</div>
              </div>
              <span className={styles.rewardBadge}>{c.reward}</span>
            </div>
            <div className={styles.challengeFooter}>
              <ProgressBar value={c.progress} variant="green" />
              <div className={styles.challengeMeta}>
                <span className={styles.progressLabel}>{c.progressLabel}</span>
                <span className={styles.expiry}>{c.expires}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
