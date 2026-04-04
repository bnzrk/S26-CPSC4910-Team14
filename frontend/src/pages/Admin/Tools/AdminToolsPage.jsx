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
import CreateUserModal from '@/components/CreateUserModal/CreateUserModal';
import CreateSponsorOrgModal from '@/components/CreateSponsorOrgModal/CreateSponsorOrgModal';
import OrgIcon from '@/assets/icons/building-2.svg?react';
import AddUserIcon from '@/assets/icons/user-round-plus.svg?react';
import UploadIcon from '@/assets/icons/upload.svg?react';
import styles from './AdminToolsPage.module.scss';



// Main Page
export default function AdminToolsPage()
{
    const { data: orgs, isLoading: orgsLoading } = useAllSponsorOrgs();
    const bulkUploadUsers = useBulkUploadUsers();
    const bulkActions = useBulkActions();

    const modals = {
        createUser: 'createUser',
        createOrg: 'createOrg',
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
                        text="Create User"
                        color="primary"
                        icon={AddUserIcon}
                        onClick={() => setActiveModal(modals.createUser)}
                    />
                    {/* <Button
                        text="Bulk Actions"
                        color="primary"
                        icon={UploadIcon}
                        onClick={() => setActiveModal(modals.bulkUsers)}
                    /> */}
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
                                color="primary"
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
            <CreateUserModal
                isOpen={activeModal === modals.createUser}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />

            <CreateSponsorOrgModal
                isOpen={activeModal === modals.createOrg}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />
        </>
    );
}