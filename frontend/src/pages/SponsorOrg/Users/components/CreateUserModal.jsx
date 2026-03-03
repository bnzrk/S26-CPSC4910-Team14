import { useState } from "react";
import { useCreateSponsorOrgUser } from "@/api/sponsorOrg";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import InlineErrors from "@/components/InlineErrors/InlineErrors";
import styles from './CreateUserModal.module.scss';
import { useToast } from "@/components/Toast/ToastContext";

export default function CreateUserModal({ isOpen, onClose, onSuccess, ...other })
{
    const createUser = useCreateSponsorOrgUser();

    const { push, clearAll } = useToast();

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errorMsgs, setErrorMsgs] = useState([]);

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function submitForm()
    {
        try
        {
            await createUser.mutateAsync({ email, firstName, lastName, password });
            resetForm();
            push({ type: 'success', message: 'User account successfully created.' });
            onSuccess();
        } catch (err)
        {  
            setErrorMsgs(Object.values(err.errors).flat());
            push({ type: 'error', message: 'Failed to create user account.' });
            return Promise.reject();
        }
    }

    function resetForm()
    {
        setEmail('');
        setFirstName('');
        setLastName('');
        setPassword('');
        setConfirmPassword('');
        setErrorMsgs([]);
    }

    function handleClose()
    {
        resetForm();
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className={styles.modal}>
            <Modal.Header title='Create Account' />
            <Modal.Body className={styles.body}>
                <form {...other} className={styles.form}>
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

                    <div className={styles.names}>
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

                    {errorMsgs?.length > 0 && (
                        <InlineErrors className={styles.registerErrors} errors={errorMsgs} />
                    )}
                </form>
            </Modal.Body>
            <Modal.Buttons position='right'>
                <Button text='Cancel' onClick={handleClose} />
                <AsyncButton text='Create User' color='primary' action={submitForm}></AsyncButton>
            </Modal.Buttons>
        </Modal>
    )
}