import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/api/currentUser";
import { useRemoveSponsorDriveUser, useSponsorOrgDriver } from "@/api/sponsorOrg"
import { useStartImpersonation } from "@/api/auth";
import { useToast } from "@/components/Toast/ToastContext";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import EditDriverProfileModal from "./components/EditDriverProfileModal";
import ManageDriverPointsModal from "./components/ManageDriverPointsModal";
import StarIcon from "@/assets/icons/star.svg?react";
import UserStarIcon from "@/assets/icons/user-star.svg?react";
import UserEditIcon from "@/assets/icons/user-pen.svg?react";
import UserRemoveIcon from "@/assets/icons/user-x.svg?react";
import LoginIcon from "@/assets/icons/log-in.svg?react";
import styles from './SponsorDriverPage.module.scss';
import clsx from "clsx";

function formatDate(dateString, includeTime = false)
{
    const timeString = dateString?.split("T")[1];
    return `${dateString?.split("T")[0]} ${includeTime ? `at ${timeString}` : ''}`;
}

export default function SponsorDriverPage()
{
    const navigate = useNavigate();

    const { push } = useToast();

    const modals = {
        editProfile: 'editProfile',
        removeDriver: 'removeDriver',
        impersonateDriver: 'impersonateDriver',
        managePoints: 'managePoints',
    }
    const [currentModal, setCurrentModal] = useState(null);

    const { mutate: impersonate, isPending } = useStartImpersonation();
    const { mutate: removeDriver, isPending: isRemoveDriverPending } = useRemoveSponsorDriveUser();
    const { data: user } = useCurrentUser();

    const { driverId: paramId } = useParams();
    const driverId = Number(paramId);
    const { data: driver, isLoading: driverLoading, isError: driverError, error } = useSponsorOrgDriver({ driverId });
    if (driverError && error?.status === 404)
    {
        return <Navigate to="/org/drivers" replace />;
    }

    async function startImpersonation()
    {
        try
        {
            await startImpersonationMutation.mutateAsync();
        }
        catch (err)
        {
            push({ type: 'error', message: 'Failed to impersonate driver.' });
        }
    }

    async function handleRemoveDriver()
    {
        try
        {
            await removeDriver(driver?.id);
            push({ type: 'success', message: 'Driver removed.' });
            navigate("/org/drivers");
        } catch (err)
        {
            push({ type: 'error', message: 'Failed to remove driver.' });
            return Promise.reject();
        }
    }

    return (
        <main className={styles.sponsorDriver}>
            <EditDriverProfileModal
                key={`edit_${driver?.id}`}
                isOpen={currentModal == modals.editProfile}
                onClose={() => setCurrentModal(null)}
                onSuccess={() => setCurrentModal(null)}
                driver={driver}
            />
            <ManageDriverPointsModal
                key={`points_${driver?.id}`}
                isOpen={currentModal == modals.managePoints}
                onClose={() => setCurrentModal(null)}
                onSuccess={() => null}
                driver={driver}
            />
            <Modal isOpen={currentModal == modals.removeDriver} onClose={() => setCurrentModal(null)}>
                <Modal.Header title='Remove Driver'/>
                <Modal.Body>
                    Remove this driver from your organization?
                </Modal.Body>
                <Modal.Buttons position='right'>
                    <Button
                        text='Cancel'
                        onClick={() => setCurrentModal(null)} 
                    />
                    <AsyncButton 
                        text='Remove'
                        color='warn'
                        action={handleRemoveDriver}
                    />
                </Modal.Buttons>
            </Modal>
            <CardHost>
                <Card title='Profile'>
                    {driver &&
                        <div className={styles.profile}>
                            <div className={styles.identity}>
                                <p className={styles.name}>{driver?.firstName} {driver?.lastName}</p>
                                <p className={styles.email}>({driver?.email})</p>
                            </div>
                            <div className={styles.dates}>
                                <div>Date Created: {formatDate(driver?.dateCreatedUtc)}</div>
                                <div>Last Login: {(driver.DateCreatedUtc) ? formatDate(driver?.lastLoginUtc, true) : 'Never'}</div>
                            </div>
                            <div className={styles.buttonGroup}>
                                <Button
                                    className={clsx(styles.editButton, styles.button)}
                                    icon={LoginIcon}
                                    text='Login-As'
                                    disabled={impersonate.isPending || (user && user.isImpersonating)}
                                    onClick={() => impersonate({ targetUserId: driver.userId })}
                                />
                                <Button
                                    className={clsx(styles.editButton, styles.button)}
                                    icon={UserEditIcon}
                                    text='Edit Profile'
                                    onClick={() => setCurrentModal(modals.editProfile)}
                                />
                                <Button 
                                    className={clsx(styles.editButton, styles.button)} 
                                    color='warn' 
                                    icon={UserRemoveIcon} 
                                    text='Remove Driver' 
                                    onClick={() => setCurrentModal(modals.removeDriver)}
                                />
                            </div>
                        </div>
                    }
                </Card>
                <Card title='Points'>
                    {driver &&
                        <div>
                            <div className={styles.points}>
                                <div className={styles.label}>Current Points</div>
                                <div className={styles.value}>
                                    {driver ? driver?.points : 0}
                                    <StarIcon />
                                </div>
                            </div>
                            <div className={styles.buttonGroup}>
                                <Button
                                    className={clsx(styles.editButton, styles.button)}
                                    color='primary' icon={UserStarIcon}
                                    text='Manage Points'
                                    onClick={() => setCurrentModal(modals.managePoints)}
                                />
                            </div>
                        </div>
                    }
                </Card>
            </CardHost>
        </main>
    );
}