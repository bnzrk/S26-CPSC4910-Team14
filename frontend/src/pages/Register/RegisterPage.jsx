import { useState } from 'react';
import { API_URL } from '@/config';
import { useNavigate } from "react-router-dom";
import styles from './RegisterPage.module.scss';

export default function RegisterPage()
{
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errorMsgs, setErrorMsgs] = useState([]); // <-- supports multiple server errors
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e)
    {
        e.preventDefault();
        setErrorMsgs([]);

        if (password !== confirmPassword)
        {
            setErrorMsgs(['Passwords do not match.']);
            return;
        }

        setIsLoading(true);

        try
        {
            const response = await fetch(`${API_URL}/drivers/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    password,
                }),
            });

            // If registration validation fails, server returns { errors: [] }
            if (response.status === 400)
            {
                let data = null;
                try
                {
                    data = await response.json();
                } catch
                {
                    // ignore JSON parse errors
                }

                if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0)
                {
                    setErrorMsgs(data.errors.map(String));
                } else
                {
                    setErrorMsgs(['Registration failed. Please check your information and try again.']);
                }
                return;
            }

            if (!response.ok)
            {
                setErrorMsgs(['Something went wrong. Please try again.']);
                return;
            }

            navigate("/login");

        } catch (err)
        {
            setErrorMsgs(['Unable to connect to the server. Please try again.']);
        } finally
        {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Good Driver Incentive Program</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            id="email"
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="firstName" className={styles.label}>First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            className={styles.input}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            autoComplete="given-name"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="lastName" className={styles.label}>Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            className={styles.input}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            autoComplete="family-name"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {errorMsgs.length > 0 && (
                        <div className={styles.error}>
                            <ul className={styles.errorList ?? undefined}>
                                {errorMsgs.map((msg, idx) => (
                                    <li key={idx}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}