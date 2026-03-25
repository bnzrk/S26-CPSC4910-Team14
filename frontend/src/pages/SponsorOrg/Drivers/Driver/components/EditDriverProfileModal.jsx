import { useState, useEffect } from "react";
import { useUpdateDriver } from "@/api/driver";
import { useToast } from "@/components/Toast/ToastContext";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import styles from './EditDriverProfileModal.module.scss';

export default function EditDriverProfileModal({ isOpen, onClose, onSuccess, driver, ...other })
{
    const { push } = useToast();

    const [email, setEmail] = useState(driver?.email);
    const [firstName, setFirstName] = useState(driver?.firstName);
    const [lastName, setLastName] = useState(driver?.lastName);

    useEffect(() =>
    {
        if (!isOpen) return;
        setEmail(driver?.email ?? "");
        setFirstName(driver?.firstName ?? "");
        setLastName(driver?.lastName ?? "");
    }, [driver?.id, isOpen]);

    async function submitForm()
    {
        return Promise.fail();
    }

    const editProfile = useUpdateDriver();

    async function submitForm()
    {
        try
        {
            await editProfile.mutateAsync({ id: driver?.id, email, firstName, lastName });
            resetForm();
            push({ type: 'success', message: 'Profile updated.' });
            onSuccess();
        } catch (err)
        {
            console.log(err);
            push({ type: 'error', message: 'Update failed. Please try again.' });
            return Promise.reject();
        }
    }

    function resetForm()
    {
        setEmail(driver?.email);
        setFirstName(driver?.firstName);
        setLastName(driver?.lastName);
    }

    function handleClose()
    {
        resetForm();
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className={styles.modal}>
            <Modal.Header title='Edit Profile' />
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
                </form>
            </Modal.Body>
            <Modal.Buttons position='right'>
                <Button text='Cancel' onClick={handleClose} />
                <AsyncButton text='Save' color='primary' action={submitForm}></AsyncButton>
            </Modal.Buttons>
        </Modal>
    )
}