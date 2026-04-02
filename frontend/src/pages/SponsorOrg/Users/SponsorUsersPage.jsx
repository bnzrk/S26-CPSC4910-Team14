import { useState } from "react";
import { useSponsorOrgUsers, useRemoveSponsorOrgUser, useBulkCreateSponsorUsers } from "@/api/sponsorOrg";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import ListItem from "@/components/ListItem/ListItem";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import BulkUploadModal from "@/components/BulkUploadModal/BulkUploadModal";
import CreateUserModal from "./components/CreateUserModal";
import UserIcon from "@/assets/icons/user.svg?react";
import AddUserIcon from "@/assets/icons/user-round-plus.svg?react";
import UploadIcon from "@/assets/icons/upload.svg?react";
import { useToast } from "@/components/Toast/ToastContext";
import styles from './SponsorUsersPage.module.scss';

function formatDate(dateString, includeTime = false)
{
    const timeString = dateString?.split("T")[1];
    return `${dateString?.split("T")[0]} ${includeTime ? `at ${timeString}` : ''}`;
}

export default function SponsorUsersPage()
{
    const modals = {
        createUser: 'createUser',
        userInfo: 'userInfo',
        bulkUpload: 'bulkUpload',
    };

    const { data: users, usersLoading, usersError } = useSponsorOrgUsers();
    const removeUser = useRemoveSponsorOrgUser();
    const bulkCreateUsers = useBulkCreateSponsorUsers();
    const { push } = useToast();

    const [activeModal, setActiveModal] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    function openUserInfo(user)
    {
        setSelectedUser(user);
        setActiveModal(modals.userInfo);
    }

    async function handleRemoveUser()
    {
        if (!selectedUser) return;
        try
        {
            await removeUser.mutateAsync({ userId: selectedUser.id });
            push({ type: 'success', message: `${selectedUser.firstName} ${selectedUser.lastName} removed.` });
            setActiveModal(null);
            setSelectedUser(null);
        }
        catch
        {
            push({ type: 'error', message: 'Failed to remove user.' });
        }
    }

    return (
        <>
            <CardHost>
                <Card
                    title="Sponsor Users"
                    headerRight={
                        <div className={styles.headerActions}>
                            <Button
                                text="Add User"
                                color="primary"
                                icon={AddUserIcon}
                                onClick={() => setActiveModal(modals.createUser)}
                            />
                            <Button
                                text="Bulk Upload"
                                color="outline"
                                icon={UploadIcon}
                                onClick={() => setActiveModal(modals.bulkUpload)}
                            />
                        </div>
                    }
                >
                    {(usersLoading) && <p className={styles.empty}>Loading users…</p>}
                    {usersError && <p className={styles.empty}>Failed to load users.</p>}

                    {users && users.length === 0 && (
                        <p className={styles.empty}>No sponsor users found.</p>
                    )}

                    {users && users.map((user) => (
                        <ListItem
                            key={user.id}
                            icon={UserIcon}
                            label={`${user.firstName} ${user.lastName}`}
                            onClick={() => openUserInfo(user)}
                            showChevron={true}
                        >
                            <p className={styles.userEmail}>{user.email}</p>
                        </ListItem>
                    ))}
                </Card>
            </CardHost>

            {/* Create Single User Modal */}
            <CreateUserModal
                isOpen={activeModal === modals.createUser}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />

            {/* Bulk Upload Sponsor Users Modal */}
            <BulkUploadModal
                isOpen={activeModal === modals.bulkUpload}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
                title="Bulk Upload Sponsor Users"
                description={
                    'Upload a CSV to add multiple sponsor users at once. ' +
                    'Required columns: email, firstName, lastName, password.'
                }
                templateCols={['email', 'firstName', 'lastName', 'password']}
                templateName="bulk_sponsor_users_template.csv"
                mutation={bulkCreateUsers}
            />

            {/* User Info / Remove Modal */}
            {selectedUser && (
                <Modal
                    isOpen={activeModal === modals.userInfo}
                    onClose={() => { setActiveModal(null); setSelectedUser(null); }}
                    closeButton
                >
                    <Modal.Header title="User Details" />
                    <Modal.Body>
                        <div className={styles.userDetails}>
                            <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            {selectedUser.createdAt && (
                                <p><strong>Added:</strong> {formatDate(selectedUser.createdAt)}</p>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            text="Cancel"
                            color="outline"
                            onClick={() => { setActiveModal(null); setSelectedUser(null); }}
                        />
                        <AsyncButton
                            text="Remove User"
                            color="warn"
                            action={handleRemoveUser}
                        />
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
}