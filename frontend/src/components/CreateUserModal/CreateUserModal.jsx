import { useState } from "react";
import { useToast } from "../Toast/ToastContext";
import { USER_TYPES } from "@/constants/userTypes";
import { USER_TYPE_ENUM } from "@/constants/userTypes";
import { useCurrentUser } from "@/api/currentUser";
import { useCreateAdminUser } from "@/api/admin";
import { useCreateSponsorOrgUser } from "@/api/sponsorOrg";
import { useCreateDriverUser } from "@/api/driver";
import { useAllSponsorOrgs } from "@/api/sponsorOrg";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import AsyncButton from "../AsyncButton/AsyncButton";
import TextInput from "../TextInput/TextInput";
import styles from "./CreateUserModal.module.scss";
import InlineInfo from "../InlineInfo/InlineInfo";

export default function CreateUserModal({ isOpen, onClose, onSuccess })
{
    const { data: user } = useCurrentUser();
    const isAdmin = user?.userType === USER_TYPES.ADMIN;

    const userOptions = Object.entries(USER_TYPE_ENUM).map(([label, val]) => ({
        label: label.charAt(0) + label.slice(1).toLowerCase(),
        value: val,
    }));

    const { data: orgs, isLoading: isOrgsLoading, isError: isOrgsError } = useAllSponsorOrgs();

    const { push } = useToast();

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');

    const [selectedOrgId, setSelectedOrgId] = useState(1);
    const [selectedUserType, setSelectedUserType] = useState(USER_TYPE_ENUM.DRIVER);

    const createAdmin = useCreateAdminUser();
    const createSponsor = useCreateSponsorOrgUser(selectedOrgId);
    const createDriver = useCreateDriverUser(selectedOrgId > -1 ? selectedOrgId : null);
    const action = selectedUserType == USER_TYPE_ENUM.ADMIN ? createAdmin :
        selectedUserType == USER_TYPE_ENUM.SPONSOR ? createSponsor :
            selectedUserType == USER_TYPE_ENUM.DRIVER ? createDriver : null;

    const isFormValid = email.trim() && firstName.trim() && lastName.trim() && password.trim();

    const [errorMsgs, setErrorMsgs] = useState([]);

    async function handleSubmit()
    {
        if (!isFormValid) return;
        try
        {
            await action.mutateAsync({ email, firstName, lastName, password, username: email });
            push({ type: 'success', message: 'User created.' });
            onSuccess?.();
            onClose();
        }
        catch (err)
        {
            setErrorMsgs(Object.values(err.errors).flat());
            push({ type: 'error', message: err?.message ?? 'Failed to create user.' });
            return Promise.reject();
        }
    }

    function handleClose()
    {
        setErrorMsgs([]);
        setEmail(''); setFirstName(''); setLastName(''); setPassword('');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} closeButton>
            <Modal.Header title={`Create User`} />
            <Modal.Body>
                <div className={styles.form}>
                    <div className={styles.selectors}>
                        <div className={styles.selectSection}>
                            <label>User Type</label>
                            <select
                                className={styles.userTypeSelect}
                                value={selectedUserType}
                                onChange={(e) => setSelectedUserType(e.target.value)}
                            >
                                {userOptions.map(({ label, value }) => (

                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {isAdmin && orgs && selectedUserType != USER_TYPE_ENUM.ADMIN &&
                            <div className={styles.selectSection}>
                                <label>Organization</label>
                                <select
                                    className={styles.orgSelect}
                                    value={selectedOrgId}
                                    onChange={(e) => setSelectedOrgId(e.target.value)}
                                    disabled={isOrgsLoading || isOrgsError}
                                >
                                    {selectedUserType == USER_TYPE_ENUM.DRIVER &&
                                        <option key={-1} value={-1}>
                                            None
                                        </option>
                                    }
                                    {orgs && orgs.length > 0 && orgs.map((org) =>
                                        <option key={org.id} value={org.id}>{org.sponsorName}</option>
                                    )}
                                </select>
                            </div>
                        }
                    </div>
                    <TextInput
                        label="Email"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                    />
                    <div className={styles.nameRow}>
                        <TextInput
                            label="First Name"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Jane"
                        />
                        <TextInput
                            label="Last Name"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                        />
                    </div>
                    <TextInput
                        label="Password"
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                {errorMsgs?.length > 0 && (
                    <InlineInfo className={styles.errors} type='warning' messages={errorMsgs} />
                )}
            </Modal.Body>
            <Modal.Buttons>
                <Button text="Cancel" color="secondary" onClick={handleClose} />
                <AsyncButton
                    text={`Create ${userOptions.find(o => o.value == selectedUserType).label}`}
                    color="primary"
                    disabled={!isFormValid}
                    action={handleSubmit}
                />
            </Modal.Buttons>
        </Modal>
    );
}