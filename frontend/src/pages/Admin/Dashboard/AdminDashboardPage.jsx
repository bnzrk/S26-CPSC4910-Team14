import { useNavigate } from 'react-router-dom';
import CardHost from '@/components/CardHost/CardHost';
import styles from './AdminDashboardPage.module.scss';

const quickLinks = [
  { label: 'Audit Logs', description: 'View and search system audit logs', path: '/admin/audit-logs' },
  { label: 'Organizations', description: 'Manage sponsor organizations', path: '/admin/orgs' },
  { label: 'Users', description: 'Manage user accounts', path: '/admin/users' },
  { label: 'Bulk Actions', description: 'Perform actions in bulk', path: '/admin/bulk' },
  { label: 'Sales Reports', description: 'View sales by sponsor or driver', path: '/admin/sales' },
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