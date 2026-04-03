import { useState } from 'react';
import { useAllSponsorOrgs, useCreateSponsorOrg } from '@/api/sponsorOrg';
import { useCreateAdminUser, useBulkUploadUsers } from '@/api/admin';
import { useBulkActions } from '@/api/bulk';
import { useToast } from '@/components/Toast/ToastContext';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import AsyncButton from '@/components/AsyncButton/AsyncButton';
import TextInput from '@/components/TextInput/TextInput';
import ListItem from '@/components/ListItem/ListItem';
import BulkUploadModal from '@/components/BulkUploadModal/BulkUploadModal';
import BulkCreateOrgsModal from './BulkCreateOrgsModal';
import OrgIcon from '@/assets/icons/building-2.svg?react';
import AddUserIcon from '@/assets/icons/user-round-plus.svg?react';
import UploadIcon from '@/assets/icons/upload.svg?react';
import styles from './AdminToolsPage.module.scss';

// Sub-component: Create Single Admin User Modal
function CreateAdminUserModal({ isOpen, onClose, onSuccess })
{
    const { push } = useToast();
    const createAdmin = useCreateAdminUser();

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');

    const isFormValid = email.trim() && firstName.trim() && lastName.trim() && password.trim();

    async function handleSubmit()
    {
        if (!isFormValid) return;
        try
        {
            await createAdmin.mutateAsync({ email, firstName, lastName, password, username: email });
            push({ type: 'success', message: 'Admin user created.' });
            onSuccess?.();
            onClose();
        }
        catch (err)
        {
            push({ type: 'error', message: err?.message ?? 'Failed to create admin.' });
        }
    }

    function handleClose()
    {
        setEmail(''); setFirstName(''); setLastName(''); setPassword('');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} closeButton>
            <Modal.Header title="Create Admin User" />
            <Modal.Body>
                <div className={styles.form}>
                    <TextInput
                        label="Email"
                        required
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="admin@example.com"
                    />
                    <div className={styles.nameRow}>
                        <TextInput
                            label="First Name"
                            required
                            value={firstName}
                            onChange={setFirstName}
                            placeholder="Jane"
                        />
                        <TextInput
                            label="Last Name"
                            required
                            value={lastName}
                            onChange={setLastName}
                            placeholder="Doe"
                        />
                    </div>
                    <TextInput
                        label="Password"
                        required
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="••••••••"
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button text="Cancel" color="outline" onClick={handleClose} />
                <AsyncButton
                    text="Create Admin"
                    color="primary"
                    disabled={!isFormValid}
                    action={handleSubmit}
                />
            </Modal.Footer>
        </Modal>
    );
}

// Sub-component: Single Sponsor Org Modal
function CreateSponsorOrgModal({ isOpen, onClose, onSuccess })
{
    const { push } = useToast();
    const createOrg = useCreateSponsorOrg();
    const [sponsorName, setSponsorName] = useState('');

    async function handleSubmit()
    {
        if (!sponsorName.trim()) return;
        try
        {
            await createOrg.mutateAsync({ sponsorName });
            push({ type: 'success', message: 'Sponsor organization created.' });
            onSuccess?.();
            onClose();
        }
        catch (err)
        {
            push({ type: 'error', message: err?.message ?? 'Failed to create organization.' });
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={() => { setSponsorName(''); onClose(); }} closeButton>
            <Modal.Header title="Create Sponsor Organization" />
            <Modal.Body>
                <TextInput
                    label="Organization Name"
                    required
                    value={sponsorName}
                    onChange={setSponsorName}
                    placeholder="Acme Freight"
                />
            </Modal.Body>
            <Modal.Footer>
                <Button text="Cancel" color="outline" onClick={() => { setSponsorName(''); onClose(); }} />
                <AsyncButton
                    text="Create"
                    color="primary"
                    disabled={!sponsorName.trim()}
                    action={handleSubmit}
                />
            </Modal.Footer>
        </Modal>
    );
}

// Main Page
export default function AdminToolsPage()
{
    const { data: orgs, isLoading: orgsLoading } = useAllSponsorOrgs();
    const bulkUploadUsers = useBulkUploadUsers();
    const bulkActions = useBulkActions();

    const modals = {
        createAdmin: 'createAdmin',
        bulkUsers: 'bulkUsers',
        createOrg: 'createOrg',
        bulkOrgs: 'bulkOrgs',
    };
    const [activeModal, setActiveModal] = useState(null);

    return (
        <>
            <CardHost title="Admin Tools" subtitle="Manage users and organizations">

                {/* ── User Management ── */}
                <Card
                    title="User Management"
                >
                    <Button
                        text="Bulk Actions"
                        color="primary"
                        icon={UploadIcon}
                        onClick={() => setActiveModal(modals.bulkUsers)}
                    />
                    <p className={styles.helpText}>
                        Create individual admin users or bulk-upload users via CSV.
                        The CSV must include: <code>email, firstName, lastName, password, role</code>
                        &nbsp;(role: <code>admin</code> | <code>sponsor</code> | <code>driver</code>).
                    </p>
                </Card>

                {/* ── Organization Management ── */}
                <Card
                    title="Sponsor Organizations"
                    headerRight={
                        <div className={styles.headerActions}>
                            <Button
                                text="Create Org"
                                color="primary"
                                icon={OrgIcon}
                                onClick={() => setActiveModal(modals.createOrg)}
                            />
                            <Button
                                text="Bulk Create Orgs"
                                color="outline"
                                icon={UploadIcon}
                                onClick={() => setActiveModal(modals.bulkOrgs)}
                            />
                        </div>
                    }
                >
                    {orgsLoading && <p className={styles.loading}>Loading organizations…</p>}
                    {!orgsLoading && (!orgs || orgs.length === 0) && (
                        <p className={styles.empty}>No sponsor organizations found.</p>
                    )}
                    {orgs && orgs.map(org => (
                        <ListItem
                            key={org.id}
                            icon={OrgIcon}
                            label={org.sponsorName}
                        >
                            <span className={styles.orgMeta}>
                                {org.userCount ?? 0} users · {org.driverCount ?? 0} drivers
                            </span>
                        </ListItem>
                    ))}
                </Card>
            </CardHost>

            {/* ── Modals ── */}
            <CreateAdminUserModal
                isOpen={activeModal === modals.createAdmin}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />

            <BulkUploadModal
                isOpen={activeModal === modals.bulkUsers}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
                title="Bulk Actions"
                description="Upload a text file to perform actions in bulk."
                templateCols={['email', 'firstName', 'lastName', 'password', 'role']}
                templateName="bulk_users_template.csv"
                mutation={bulkActions}
            />

            <CreateSponsorOrgModal
                isOpen={activeModal === modals.createOrg}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />

            <BulkCreateOrgsModal
                isOpen={activeModal === modals.bulkOrgs}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />
        </>
    );
}