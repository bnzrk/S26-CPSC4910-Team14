import { useNavigate } from 'react-router-dom';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import styles from './AdminDashboardPage.module.scss';

const quickLinks = [
  { label: 'Admin Tools', description: 'Create orgs, sponsors, and admins', path: '/admin/tools' },
  { label: 'Audit Logs', description: 'View and search system audit logs', path: '/admin/audit-logs' },
  { label: 'Users', description: 'Manage user accounts', path: '/admin/users' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <main>
      <CardHost title="Admin Dashboard" subtitle="Quick access to admin features">
        <div className={styles.grid}>
          {quickLinks.map(link => (
            <div
              key={link.path}
              className={styles.card}
              onClick={() => navigate(link.path)}
            >
              <h2 className={styles.cardTitle}>{link.label}</h2>
              <p className={styles.cardDesc}>{link.description}</p>
            </div>
          ))}
        </div>
      </CardHost>
    </main>
  );
}