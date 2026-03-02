import { useState } from "react";
import { useSponsorOrgUsers } from "@/api/sponsorOrg";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import ListItem from "@/components/ListItem/ListItem";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import UserIcon from "@/assets/icons/user.svg?react";
import AddUserIcon from "@/assets/icons/user-round-plus.svg?react";
import styles from './SponsorUsersPage.module.scss';

function formatDate(dateString, includeTime = false)
{
    const timeString = dateString?.split("T")[1];
    return `${dateString?.split("T")[0]} ${includeTime ? `at ${timeString}` : ''}`;
}

export default function SponsorUsersPage()
{
    const { data: users, usersLoading, usersError } = useSponsorOrgUsers();

    const [showUserModal, setShowUserModal] = useState(false);
    const [modalUser, setModalUser] = useState(null);

    function openUserModal(user)
    {
        setModalUser(user);
        setShowUserModal(true);
    }

    return (
        <main className={styles.sponsorUsers}>
            <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} className={styles.userModal}>
                <Modal.Header title='User Account' />
                <Modal.Body className={styles.body}>
                    <div className={styles.userInfo}>
                        <div className={styles.userHeader}>
                            <p className={styles.userName}>{modalUser?.firstName} {modalUser?.lastName}</p>
                            <p className={styles.userEmail}>({modalUser?.email})</p>
                        </div>
                        <div className={styles.userDetails}>
                            <div>Date Created: {formatDate(modalUser?.dateCreatedUtc)}</div>
                            <div>Last Login: {formatDate(modalUser?.lastLoginUtc, true)}</div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <CardHost title='Users' subtitle="Manage your organization's users">
                <Card title='Accounts' headerRight={
                    <Button text='New' size='small' icon={AddUserIcon}></Button>
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