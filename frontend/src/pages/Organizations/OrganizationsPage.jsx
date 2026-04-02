import { useNavigate } from 'react-router-dom';
import { useDriverOrgs } from '@/api/driver';
import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import Card from '@/components/Card/Card';
import Avatar from '@/components/Avatar/Avatar';
import Button from '@/components/Button/Button';
import styles from './OrganizationsPage.module.scss';
import clsx from 'clsx';

function getInitials(name) {
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const { data: orgs } = useDriverOrgs();
  const { selectedOrgId, setSelectedOrgId } = useOrgContext();

  const orgList = orgs ?? [];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Organizations</h1>

      {/* My Organizations */}
      <Card title="My Organizations">
        {orgList.length === 0 ? (
          <p className={styles.empty}>
            You aren&apos;t affiliated with any organizations yet. Apply below to get started.
          </p>
        ) : (
          <div className={styles.orgList}>
            {orgList.map(org => {
              const name = org?.sponsorName ?? org?.name ?? 'Unknown Org';
              const isSelected = String(org.id) === String(selectedOrgId);
              const ratio = org?.pointRatio ?? 0.01;
              return (
                <div key={org.id} className={styles.orgCard}>
                  <div className={styles.orgLeft}>
                    <Avatar initials={getInitials(name)} size="md" shape="rounded" />
                    <div className={styles.orgMeta}>
                      <span className={styles.orgName}>{name}</span>
                      <span className={styles.orgRatio}>
                        ${ratio.toFixed(2)} per point
                      </span>
                    </div>
                  </div>
                  <div className={styles.orgActions}>
                    {isSelected ? (
                      <span className={clsx(styles.badge, styles.badgeCurrent)}>Current</span>
                    ) : (
                      <Button
                        color="primary"
                        size="small"
                        onClick={() => setSelectedOrgId(org.id)}
                      >
                        Select
                      </Button>
                    )}
                    <span className={clsx(styles.badge, styles.badgeActive)}>Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Apply */}
      <Card title="Apply to an Organization">
        <p className={styles.applyBody}>
          Submit an application to join a sponsor&apos;s driver program. The sponsor will review and accept or reject your application.
        </p>
        <Button color="primary" onClick={() => navigate('/driver-application')}>
          Start Application
        </Button>
      </Card>
    </div>
  );
}
