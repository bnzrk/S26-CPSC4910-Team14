import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_URL } from '../../config';
import styles from './ProfilePage.module.scss';

async function fetchProfile() {
  const response = await fetch(`${API_URL}/auth/profile`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

async function updateProfile(data) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
}

async function updatePassword(data) {
  const response = await fetch(`${API_URL}/auth/profile/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(Array.isArray(err) ? err.join(', ') : 'Failed to update password');
  }
}

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Populate form once profile loads
  useState(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setEmail(profile.email);
    }
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
    },
    onError: (err) => {
      setProfileError(err.message || 'Failed to update profile.');
      setProfileSuccess('');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setPasswordSuccess('Password changed successfully!');
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) => {
      setPasswordError(err.message || 'Failed to change password.');
      setPasswordSuccess('');
    },
  });

  function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    profileMutation.mutate({ firstName, lastName, email });
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  }

  if (isLoading) return <div className={styles.page}><p className={styles.muted}>Loading...</p></div>;
  if (isError) return <div className={styles.page}><p className={styles.error}>Failed to load profile.</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>My Profile</h1>
          <p className={styles.heroSubtitle}>View and update your account information.</p>
        </div>
      </div>

      <div className={styles.container}>

        {/* Profile Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>First Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Role</label>
              <input
                type="text"
                className={styles.input}
                value={profile?.userType || ''}
                disabled
              />
            </div>
            {profileSuccess && <p className={styles.success}>{profileSuccess}</p>}
            {profileError && <p className={styles.error}>{profileError}</p>}
            <button type="submit" className={styles.button} disabled={profileMutation.isPending}>
              {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Current Password</label>
              <input
                type="password"
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>New Password</label>
              <input
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm New Password</label>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordSuccess && <p className={styles.success}>{passwordSuccess}</p>}
            {passwordError && <p className={styles.error}>{passwordError}</p>}
            <button type="submit" className={styles.button} disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}