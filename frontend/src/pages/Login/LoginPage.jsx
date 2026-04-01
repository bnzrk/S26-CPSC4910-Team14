import { useState } from 'react';
import { apiFetch } from '@/api/apiFetch';
import { API_URL } from '../../config';
import { queryClient } from '../../api/queryClient';
import { useNavigate } from "react-router-dom";
import styles from './LoginPage.module.scss';
import { USER_TYPES } from '../../constants/userTypes';

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (response.status === 400) {
        setErrorMsg('Incorrect email or password.');
        return;
      }

      if (!response.ok) {
        setErrorMsg('Something went wrong. Please try again.');
        return;
      }
      
      await queryClient.invalidateQueries(["currentUser"]);

      const userType = user?.userType;
      if (userType === USER_TYPES.SPONSOR) navigate("/org");
      else if (userType === USER_TYPES.ADMIN) navigate("/admin");
      else navigate("/driver");

    } catch (err) {
      setErrorMsg('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Good Driver Incentive Program</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
              required
              autoComplete="current-password"
            />
          </div>
          
          <div className={styles.rememberMe}>
            <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>
        </div>

          {errorMsg && (
            <p className={styles.error}>{errorMsg}</p>
          )}

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}