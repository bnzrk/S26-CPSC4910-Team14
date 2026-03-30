import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/api/apiFetch';
import { queryClient } from '@/api/queryClient';
import { API_URL } from '../../config';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import LogoutIcon from '@/assets/icons/log-out.svg?react';
import styles from './ProfilePage.module.scss';

async function fetchProfile()
{
  const response = await fetch(`${API_URL}/auth/profile`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

async function updateProfile(data)
{
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
}

async function updatePassword(data)
{
  const response = await fetch(`${API_URL}/auth/profile/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok)
  {
    const err = await response.json().catch(() => null);
    throw new Error(Array.isArray(err) ? err.join(', ') : 'Failed to update password');
  }
}

export default function ProfilePage()
{
  const navigate = useNavigate();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form once profile loads
  useState(() =>
  {
    if (profile)
    {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setEmail(profile.email);
    }
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () =>
    {
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
    },
    onError: (err) =>
    {
      setProfileError(err.message || 'Failed to update profile.');
      setProfileSuccess('');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () =>
    {
      setPasswordSuccess('Password changed successfully!');
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) =>
    {
      setPasswordError(err.message || 'Failed to change password.');
      setPasswordSuccess('');
    },
  });

  function handleProfileSubmit(e)
  {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    profileMutation.mutate({ firstName, lastName, email });
  }

  function handlePasswordSubmit(e)
  {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    if (newPassword !== confirmPassword)
    {
      setPasswordError('New passwords do not match.');
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  }

  async function handleDeleteAccount()
  {
    try
    {
      await fetch(`${API_URL}/auth/account`, {
        method: 'DELETE',
        credentials: 'include',
      });
      window.location.href = '/login';
    } catch (err)
    {
      console.error('Failed to delete account:', err);
    }
  }

  if (isLoading) return <div className={styles.page}><p className={styles.muted}>Loading...</p></div>;
  if (isError) return <div className={styles.page}><p className={styles.error}>Failed to load profile.</p></div>;

  async function handleLogout()
  {
    try
    {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err)
    {
      console.error("Logout failed:", err);
    }
    queryClient.invalidateQueries(["currentUser"]);
    navigate("/");
  }

  return (
    <CardHost className={styles.page} title='My Profile' subtitle='View and update your account information.'>
      {/* Profile Info */}
      <Card title='Profile' className={styles.card}>
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
          <Button
            type='submit'
            className={styles.button}
            color='primary'
            disabled={profileMutation.isPending}
            text={profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          />
        </form>
      </Card>

      {/* Change Password */}
      <Card title='Change Password' className={styles.card}>
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
          <Button
            type='submit'
            className={styles.button}
            color='primary'
            disabled={passwordMutation.isPending}
            text={passwordMutation.isPending ? 'Updating...' : 'Change Password'}
          />
        </form>
      </Card>
      {/* Delete Account */}
      <Card title='Delete Account'>
        <p>This will permanently delete your account and cannot be undone.</p>
        {!showDeleteConfirm ? (
          <button className={styles.buttonDelete} onClick={() => setShowDeleteConfirm(true)}>
            Delete Account
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: '#d32f2f', fontWeight: '500' }}>Are you sure? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className={styles.buttonDelete} onClick={handleDeleteAccount}>
                Yes, Delete My Account
              </button>
              <button className={styles.buttonCancel} onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>
      <Button text='Sign Out' onClick={handleLogout} icon={LogoutIcon} />
    </CardHost>
  );
}