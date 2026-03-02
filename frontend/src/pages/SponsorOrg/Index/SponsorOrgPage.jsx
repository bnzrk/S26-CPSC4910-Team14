import { useSponsorOrg, useRenameSponsorOrg } from '@/api/sponsorOrg';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card/Card';
import CardHost from '@/components/CardHost/CardHost';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import ListItem from '@/components/ListItem/ListItem';
import UsersIcon from '@/assets/icons/users.svg?react';     
import ListChecksIcon from '@/assets/icons/list-checks.svg?react';
import HandbagIcon from '@/assets/icons/handbag.svg?react';
import TruckIcon from '@/assets/icons/truck.svg?react';
import FileIcon from '@/assets/icons/file-pen-line.svg?react';
import EditIcon from '@/assets/icons/square-pen.svg?react';
import styles from './SponsorOrgPage.module.scss';

function formatDate(dateString)
{
    return dateString.split("T")[0];
}

export default function SponsorOrgPage()
{
    const navigate = useNavigate();
    const { data: org, orgLoading, orgError } = useSponsorOrg();

    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    useEffect(() =>
    {
        if (org?.sponsorName) setRenameValue(org.sponsorName);
    }, [org?.sponsorName, showRenameModal]);


    const renameOrgMutation = useRenameSponsorOrg();
    const handleSaveRename = () =>
    {
        const name = renameValue.trim();
        if (!name || !org) return;

        renameOrgMutation.mutate({ name });

        setShowRenameModal(false);
    };

    return (
        <main className={styles.org}>
            <Modal isOpen={showRenameModal} closeButton={true} onClose={() => setShowRenameModal(false)}>
                <Modal.Header title='Rename Organization'></Modal.Header>
                <Modal.Body>
                    <div className={styles.renameForm}>
                        <label>Enter a name for your organization:</label>
                        <input
                            name='orgName'
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                        >
                        </input>
                    </div>
                </Modal.Body>
                <Modal.Buttons position='right'>
                    <Button text='Cancel' onClick={() => setShowRenameModal(false)}></Button>
                    <Button text='Save' color='primary' onClick={handleSaveRename}></Button>
                </Modal.Buttons>
            </Modal>
            <CardHost title={'Organization'} subtitle={'View and manage your sponsor organization'}>
                <Card variant='primary' className={styles.orgCard}>
                    {org && !orgLoading && !orgError &&
                        <div className={styles.orgInfo}>
                            <div className={styles.orgInfoHeader}>
                                <h2 className={styles.orgName}>
                                    {org.sponsorName}
                                    <div className={styles.edit} onClick={() => setShowRenameModal(true)}>
                                        <EditIcon />
                                    </div>
                                </h2>
                                <p className={styles.dateJoined}><b>Joined: </b>{formatDate(org.dateJoined)}</p>
                            </div>
                            <div className={styles.orgInfoStats}>
                                <div className={styles.stat}><UsersIcon /> <span>{org.sponsorCount} User{org.sponsorCount == 1 ? '' : 's'}</span></div>
                                <div className={styles.stat}><TruckIcon /> <span>{org.driverCount} Driver{org.driverCount == 1 ? '' : 's'}</span></div>
                            </div>
                        </div>
                    }
                </Card>
                <Card title='Manage Organization'>
                    <ListItem icon={UsersIcon} label='Users' showChevron={true} onClick={() => navigate("users")}></ListItem>
                    <ListItem icon={HandbagIcon} label='Catalog' showChevron={true}></ListItem>
                    <ListItem icon={ListChecksIcon} label='Point Rules' showChevron={true} onClick={() => navigate("point-rules")}></ListItem>
                    <ListItem icon={TruckIcon} label='Drivers' showChevron={true}></ListItem>
                    <ListItem icon={FileIcon} label='Driver Applications' showChevron={true}></ListItem>
                </Card>
            </CardHost>
        </main>
    );
}