import { useState } from "react";
import { useSponsorOrgUsers, useRemoveSponsorOrgUser } from "@/api/sponsorOrg";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import ListItem from "@/components/ListItem/ListItem";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import CreateUserModal from "./components/CreateUserModal";
import UserIcon from "@/assets/icons/user.svg?react";
import AddUserIcon from "@/assets/icons/user-round-plus.svg?react";
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
    }

    const { data: users, usersLoading, usersError } = useSponsorOrgUsers();
    const removeUser = useRemoveSponsorOrgUser();
    const { push } = useToast();

    const [currentModal, setCurrentModal] = useState(null);
    const [modalUser, setModalUser] = useState(null);
    const [confirmRemove, setConfirmRemove] = useState(false);

    function openUserModal(user)
    {
        setModalUser(user);
        setConfirmRemove(false);
        setCurrentModal(modals.userInfo);
    }

    function closeUserModal()
    {
        setCurrentModal(null);
        setConfirmRemove(false);
    }

    async function handleRemove()
    {
        try
        {
            await removeUser.mutateAsync(modalUser.id);
            push({ type: 'success', message: 'Employee removed successfully.' });
            closeUserModal();
        } catch
        {
            push({ type: 'error', message: 'Failed to remove employee.' });
            return Promise.reject();
        }
    }

    return (
        <main className={styles.sponsorUsers}>
            <CreateUserModal
                isOpen={currentModal == modals.createUser}
                onClose={() => setCurrentModal(null)}
                onSuccess={() => setCurrentModal(null)}
            />
            <Modal isOpen={currentModal == modals.userInfo} onClose={closeUserModal} className={styles.userModal}>
                <Modal.Header title='User Account' />
                <Modal.Body className={styles.body}>
                    {modalUser &&
                        <div className={styles.userInfo}>
                            <div className={styles.userHeader}>
                                <p className={styles.userName}>{modalUser?.firstName} {modalUser?.lastName}</p>
                                <p className={styles.userEmail}>({modalUser?.email})</p>
                            </div>
                            <div className={styles.userDetails}>
                                <div>Date Created: {formatDate(modalUser?.dateCreatedUtc)}</div>
                                <div>Last Login: {(modalUser.lastLoginUtc) ? formatDate(modalUser?.lastLoginUtc, true) : 'Never'}</div>
                            </div>
                        </div>
                    }
                </Modal.Body>
                <Modal.Buttons position='left'>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!confirmRemove
                            ? <Button text='Remove Employee' color='warn' onClick={() => setConfirmRemove(true)} />
                            : <>
                                <AsyncButton text='Confirm Remove' color='warn' action={handleRemove} />
                                <Button text='Cancel' onClick={() => setConfirmRemove(false)} />
                            </>
                        }
                    </div>
                    <Button text='Close' onClick={closeUserModal} />
                </Modal.Buttons>
            </Modal>
            <CardHost title='Users' subtitle="Manage your organization's users">
                <Card title='Accounts' headerRight={
                    <Button text='New' size='small' icon={AddUserIcon} onClick={() => setCurrentModal(modals.createUser)}></Button>
                }>
                    {users && users.items.map((user) => (
                        <ListItem key={user.id} icon={UserIcon} label={`${user.firstName} ${user.lastName}`} onClick={() => openUserModal(user)}>
                            <p className={styles.userEmail}>{user.email}</p>
                        </ListItem>
                    ))}
                </Card>
            </CardHost>
        </main>
    );
}