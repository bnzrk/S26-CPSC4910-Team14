import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useHelp } from '@/contexts/useHelp';
import { useCurrentUser } from '@/api/currentUser';
import { USER_TYPES } from '@/constants/userTypes';
import { DRIVER_TOPICS, SPONSOR_TOPICS } from './helpContent';
import styles from './HelpPanel.module.scss';
import clsx from 'clsx';

export default function HelpPanel() {
  const { isOpen, closeHelp } = useHelp();
  const { data: user } = useCurrentUser();

  const isDriver = user?.userType === USER_TYPES.DRIVER;
  const topics = isDriver ? DRIVER_TOPICS : SPONSOR_TOPICS;

  const [selectedId, setSelectedId] = useState(topics[0].id);

  // Reset to first topic when role changes (e.g. impersonation)
  useEffect(() => {
    setSelectedId(topics[0].id);
  }, [isDriver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key closes panel
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') closeHelp(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeHelp]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeTopic = topics.find(t => t.id === selectedId) ?? topics[0];

  return createPortal(
    <div className={styles.overlay} onClick={closeHelp}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <span className={styles.wordmark}>
            <span className={styles.drive}>Drive</span>
            <span className={styles.points}>Points</span>
          </span>
          <span className={styles.panelTitle}>Help &amp; Support</span>
          <button
            className={styles.closeBtn}
            onClick={closeHelp}
            aria-label="Close help panel"
          >
            <X size={20} />
          </button>
        </header>

        <div className={styles.body}>
          <nav className={styles.topicNav}>
            {topics.map(t => (
              <button
                key={t.id}
                className={clsx(styles.topicBtn, t.id === selectedId && styles.active)}
                onClick={() => setSelectedId(t.id)}
              >
                {t.title}
              </button>
            ))}
          </nav>

          <article className={styles.content}>
            <h2 className={styles.contentTitle}>{activeTopic.title}</h2>
            {activeTopic.qa.map((item, i) => (
              <div key={i} className={styles.qa}>
                <p className={styles.question}>{item.q}</p>
                <p className={styles.answer}>{item.a}</p>
              </div>
            ))}
          </article>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
