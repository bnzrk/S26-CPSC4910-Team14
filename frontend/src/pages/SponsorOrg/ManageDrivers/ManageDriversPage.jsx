import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '@/api/apiFetch';
import { useSponsorOrgDrivers } from '@/api/sponsorOrg';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import ListItem from '@/components/ListItem/ListItem';
import TruckIcon from '@/assets/icons/truck.svg?react';
import styles from './ManageDriversPage.module.scss';

async function fetchApplications() {
  const res = await apiFetch('/applications');
  if (!res.ok) throw new Error('Failed to load applications');
  return res.json();
}

async function acceptApplication(id) {
  const res = await apiFetch(`/applications/${id}/accept`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to accept application');
}

async function rejectApplication(id) {
  const res = await apiFetch(`/applications/${id}/reject`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reject application');
}

function formatStatus(status) {
  if (status === null || status === undefined) return 'Unknown';
  if (typeof status === 'string') return status;
  switch (status) {
    case 0: return 'Pending';
    case 1: return 'Accepted';
    case 2: return 'Rejected';
    default: return 'Unknown';
  }
}

function formatDate(value) {
  if (!value) return 'No date';
  const d = new Date(value);
  return isNaN(d.getTime()) ? 'No date' : d.toLocaleDateString();
}

function getDriverName(app) {
  const full = `${app.firstName?.trim() ?? ''} ${app.lastName?.trim() ?? ''}`.trim();
  return full || 'Unnamed Driver';
}

function StatusBadge({ status }) {
  const label = formatStatus(status);
  const key = label.toLowerCase();
  return <span className={`${styles.badge} ${styles[`badge_${key}`]}`}>{label}</span>;
}

export default function ManageDriversPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');

  // Applications — same queryKey as SponsorDriverApplicationsPage (shared cache)
  const {
    data: applications = [],
    isLoading: appsLoading,
    isError: appsError,
  } = useQuery({
    queryKey: ['sponsor-applications'],
    queryFn: fetchApplications,
    staleTime: 30_000,
  });

  // Drivers — same hook as sidebar / SponsorDriversPage
  const { data: driversPage } = useSponsorOrgDrivers();

  const acceptMutation = useMutation({
    mutationFn: acceptApplication,
    onMutate: async id => {
      setActionError('');
      await queryClient.cancelQueries({ queryKey: ['sponsor-applications'] });
      const prev = queryClient.getQueryData(['sponsor-applications']);
      queryClient.setQueryData(['sponsor-applications'], old =>
        (old ?? []).map(a =>
          a.id === id ? { ...a, status: typeof a.status === 'string' ? 'Accepted' : 1 } : a
        )
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['sponsor-applications'], ctx.prev);
      setActionError('Failed to accept application.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['sponsor-applications'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectApplication,
    onMutate: async id => {
      setActionError('');
      await queryClient.cancelQueries({ queryKey: ['sponsor-applications'] });
      const prev = queryClient.getQueryData(['sponsor-applications']);
      queryClient.setQueryData(['sponsor-applications'], old =>
        (old ?? []).map(a =>
          a.id === id ? { ...a, status: typeof a.status === 'string' ? 'Rejected' : 2 } : a
        )
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['sponsor-applications'], ctx.prev);
      setActionError('Failed to reject application.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['sponsor-applications'] }),
  });

  const sortedApps = useMemo(() => [...applications].sort((a, b) => b.id - a.id), [applications]);

  function handleAccept(e, id) {
    e.stopPropagation();
    if (acceptMutation.isPending || rejectMutation.isPending) return;
    acceptMutation.mutate(id);
  }

  function handleReject(e, id) {
    e.stopPropagation();
    if (acceptMutation.isPending || rejectMutation.isPending) return;
    rejectMutation.mutate(id);
  }

  const drivers = driversPage?.items ?? [];

  return (
    <main className={styles.page}>
      <CardHost title="Manage Drivers" subtitle="Review applications and manage current drivers">

        {/* Applications Section */}
        <Card
          title="Incoming Applications"
          footer={
            <Link to="/org/applications" className={styles.viewAll}>
              View all applications →
            </Link>
          }
        >
          {actionError && <p className={styles.error}>{actionError}</p>}
          {appsLoading && <p className={styles.empty}>Loading applications…</p>}
          {appsError && <p className={styles.error}>Failed to load applications.</p>}
          {!appsLoading && !appsError && sortedApps.length === 0 && (
            <p className={styles.empty}>No pending applications.</p>
          )}
          {!appsLoading && !appsError && sortedApps.map(app => {
            const statusLabel = formatStatus(app.status);
            const isResolved =
              statusLabel.toLowerCase() === 'accepted' ||
              statusLabel.toLowerCase() === 'rejected';
            const isMutating =
              (acceptMutation.isPending && acceptMutation.variables === app.id) ||
              (rejectMutation.isPending && rejectMutation.variables === app.id);

            return (
              <div key={app.id} className={styles.appRow}>
                <div className={styles.appMain}>
                  <span className={styles.appName}>{getDriverName(app)}</span>
                  <span className={styles.appDate}>
                    Submitted: {formatDate(app.createdAt || app.dateCreated)}
                  </span>
                </div>
                <div className={styles.appSide}>
                  <StatusBadge status={app.status} />
                  <div className={styles.appActions}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.acceptBtn}`}
                      disabled={isResolved || isMutating}
                      onClick={e => handleAccept(e, app.id)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.rejectBtn}`}
                      disabled={isResolved || isMutating}
                      onClick={e => handleReject(e, app.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Drivers Section */}
        <Card title="Current Drivers">
          {drivers.length === 0 ? (
            <p className={styles.empty}>No drivers in your organization yet.</p>
          ) : (
            drivers.map(driver => (
              <ListItem
                key={driver.id}
                icon={TruckIcon}
                label={`${driver.firstName} ${driver.lastName}`}
                onClick={() => navigate(`/org/drivers/${driver.id}`)}
                showChevron={true}
              >
                <p className={styles.driverEmail}>{driver.email}</p>
              </ListItem>
            ))
          )}
        </Card>

      </CardHost>
    </main>
  );
}
