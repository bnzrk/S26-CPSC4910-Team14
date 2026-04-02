import { useState } from "react";
import { useSponsorOrgDrivers } from "@/api/sponsorOrg";
import { useNavigate } from "react-router-dom";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import ListItem from "@/components/ListItem/ListItem";
import Button from "@/components/Button/Button";
import BulkCreateDriversModal from "./BulkCreateDriversModal";
import BulkUpdatePointsModal from "./BulkUpdatePointsModal";
import BulkUpdateDriversModal from "./BulkUpdateDriversModal";
import TruckIcon from '@/assets/icons/truck.svg?react';
import UploadIcon from '@/assets/icons/upload.svg?react';
import StarIcon from '@/assets/icons/star.svg?react';
import EditIcon from '@/assets/icons/square-pen.svg?react';
import styles from './SponsorDriversPage.module.scss';

const MODALS = {
    bulkCreate: 'bulkCreate',
    bulkPoints: 'bulkPoints',
    bulkUpdate: 'bulkUpdate',
};

export default function SponsorDriversPage()
{
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState(null);

    const { data: drivers, isLoading, isError } = useSponsorOrgDrivers();

    return (
        <>
            <CardHost>
                <Card
                    title="Driver Accounts"
                    headerRight={
                        <div className={styles.headerActions}>
                            <Button
                                text="Bulk Create Drivers"
                                color="primary"
                                icon={UploadIcon}
                                onClick={() => setActiveModal(MODALS.bulkCreate)}
                            />
                            <Button
                                text="Bulk Update Points"
                                color="outline"
                                icon={StarIcon}
                                onClick={() => setActiveModal(MODALS.bulkPoints)}
                            />
                            <Button
                                text="Bulk Update Info"
                                color="outline"
                                icon={EditIcon}
                                onClick={() => setActiveModal(MODALS.bulkUpdate)}
                            />
                        </div>
                    }
                >
                    {isLoading && <p className={styles.empty}>Loading drivers…</p>}
                    {isError && <p className={styles.empty}>Failed to load drivers.</p>}

                    {drivers && drivers.items?.length === 0 && (
                        <p className={styles.empty}>
                            Your organization currently has no drivers.
                        </p>
                    )}

                    {drivers && drivers.items?.map((driver) => (
                        <ListItem
                            key={driver.id}
                            icon={TruckIcon}
                            label={`${driver.firstName} ${driver.lastName}`}
                            onClick={() => navigate(`${driver.id}`)}
                            showChevron={true}
                        >
                            <p className={styles.driverEmail}>{driver.email}</p>
                        </ListItem>
                    ))}
                </Card>
            </CardHost>

            <BulkCreateDriversModal
                isOpen={activeModal === MODALS.bulkCreate}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />

            <BulkUpdatePointsModal
                isOpen={activeModal === MODALS.bulkPoints}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />

            <BulkUpdateDriversModal
                isOpen={activeModal === MODALS.bulkUpdate}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />
        </>
    );
}