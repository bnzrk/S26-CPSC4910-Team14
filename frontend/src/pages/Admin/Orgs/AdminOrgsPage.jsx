import { useState } from 'react';
import { useAllSponsorOrgs } from '@/api/sponsorOrg';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import ListItem from '@/components/ListItem/ListItem';
import CreateSponsorOrgModal from '@/components/CreateSponsorOrgModal/CreateSponsorOrgModal';
import OrgIcon from '@/assets/icons/building-2.svg?react';
import PlusIcon from '@/assets/icons/plus.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';
import styles from './AdminOrgsPage.module.scss';

export default function AdminOrgsPage() {
    const { data: orgs, isLoading: orgsLoading } = useAllSponsorOrgs();

    const modals = { createOrg: 'createOrg' };
    const [activeModal, setActiveModal] = useState(null);

    return (
        <>
            <CardHost>
                <Card
                    title="Sponsor Organizations"
                    headerRight={
                        <Button
                            text="New"
                            color="secondary"
                            size="small"
                            icon={PlusIcon}
                            onClick={() => setActiveModal(modals.createOrg)}
                        />
                    }
                >
                    {orgsLoading && (
                        <p className={styles.loading}>Loading organizations…</p>
                    )}

                    {!orgsLoading && (!orgs || orgs.length === 0) && (
                        <p className={styles.empty}>No sponsor organizations found.</p>
                    )}

                    {orgs?.map(org => (
                        <ListItem
                            key={org.id}
                            icon={OrgIcon}
                            label={org.sponsorName}
                        >
                            <span className={styles.orgMeta}>
                                {org.sponsorCount ?? 0} users · {org.driverCount ?? 0} drivers
                            </span>

                            <div className={styles.orgActions}>
                                <Button
                                    text="Add Driver"
                                    color="primary"
                                    size="small"
                                    icon={PlusIcon}
                                    onClick={() => handleAdd(org.id)}
                                />
                                <Button
                                    text="Remove Driver"
                                    color="danger"
                                    size="small"
                                    icon={TrashIcon}
                                    onClick={() => handleRemove(org.id)}
                                />
                            </div>
                        </ListItem>
                    ))}
                </Card>
            </CardHost>

            <CreateSponsorOrgModal
                isOpen={activeModal === modals.createOrg}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />
        </>
    );
}