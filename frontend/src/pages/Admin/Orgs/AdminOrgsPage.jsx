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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import { assignDriverToOrg, removeDriverFromOrg } from "@/api/admin";

export default function AdminOrgsPage()
{
    const { data: orgs, isLoading: orgsLoading } = useAllSponsorOrgs();

    const queryClient = useQueryClient();
    const { push } = useToast();

    const modals = {
        createOrg: 'createOrg',
    };

    const [activeModal, setActiveModal] = useState(null);

    // ADD DRIVER MODAL
    const [addDriverOpen, setAddDriverOpen] = useState(false);
    const [addOrgId, setAddOrgId] = useState(null);
    const [addDriverId, setAddDriverId] = useState("");

    // REMOVE DRIVER MODAL (NEW)
    const [removeDriverOpen, setRemoveDriverOpen] = useState(false);
    const [removeOrgId, setRemoveOrgId] = useState(null);
    const [removeDriverId, setRemoveDriverId] = useState("");

    const assignMutation = useMutation({
        mutationFn: ({ userId, orgId }) =>
            assignDriverToOrg(userId, orgId),
        onSuccess: () =>
        {
            push({ type: "success", message: "Driver added to org" });
            queryClient.invalidateQueries(["sponsorOrgs"]);
        },
        onError: () =>
            push({ type: "error", message: "Failed to add driver" }),
    });

    const removeMutation = useMutation({
        mutationFn: ({ userId, orgId }) =>
            removeDriverFromOrg(userId, orgId),
        onSuccess: () =>
        {
            push({ type: "success", message: "Driver removed from org" });
            queryClient.invalidateQueries(["sponsorOrgs"]);
        },
        onError: () =>
            push({ type: "error", message: "Failed to remove driver" }),
    });

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
                    {orgsLoading && <p className={styles.loading}>Loading organizations…</p>}

                    {!orgsLoading && (!orgs || orgs.length === 0) && (
                        <p className={styles.empty}>No sponsor organizations found.</p>
                    )}

                    {orgs?.map(org => (
                        <ListItem
                            key={org.id}
                            icon={OrgIcon}
                            label={org.sponsorName}
                            right={
                                <div className={styles.orgActions}>
                                    {/* ADD DRIVER */}
                                    <Button
                                        text="Add Driver"
                                        color="primary"
                                        size="small"
                                        icon={PlusIcon}
                                        onClick={() =>
                                        {
                                            setAddOrgId(org.id);
                                            setAddDriverId("");
                                            setAddDriverOpen(true);
                                        }}
                                    />

                                    {/* REMOVE DRIVER (NOW OPENS MODAL) */}
                                    <Button
                                        text="Remove Driver"
                                        color="danger"
                                        size="small"
                                        icon={TrashIcon}
                                        onClick={() =>
                                        {
                                            setRemoveOrgId(org.id);
                                            setRemoveDriverId("");
                                            setRemoveDriverOpen(true);
                                        }}
                                    />
                                </div>
                            }
                        >
                            <span className={styles.orgMeta}>
                                {org.sponsorCount ?? 0} users · {org.driverCount ?? 0} drivers
                            </span>
                        </ListItem>
                    ))}
                </Card>
            </CardHost>

            {/* CREATE ORG MODAL */}
            <CreateSponsorOrgModal
                isOpen={activeModal === modals.createOrg}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />

            {/* ADD DRIVER MODAL */}
            {addDriverOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <h3>Add Driver</h3>

                        <p className={styles.modalText}>
                            Enter the Driver ID to assign to this organization.
                        </p>

                        <input
                            className={styles.modalInput}
                            type="number"
                            placeholder="Driver ID"
                            value={addDriverId}
                            onChange={(e) =>
                                setAddDriverId(e.target.value)
                            }
                        />

                        <div className={styles.modalActions}>
                            <Button
                                text="Cancel"
                                color="secondary"
                                onClick={() => setAddDriverOpen(false)}
                            />

                            <Button
                                text="Confirm Add"
                                color="primary"
                                onClick={() =>
                                {
                                    if (!addDriverId) return;

                                    assignMutation.mutate({
                                        userId: Number(addDriverId),
                                        orgId: addOrgId,
                                    });

                                    setAddDriverOpen(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* REMOVE DRIVER MODAL (NEW CONFIRMATION FLOW) */}
            {removeDriverOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <h3>Remove Driver</h3>

                        <p className={styles.modalText}>
                            Enter the Driver ID to remove from this organization.
                        </p>

                        <input
                            className={styles.modalInput}
                            type="number"
                            placeholder="Driver ID"
                            value={removeDriverId}
                            onChange={(e) =>
                                setRemoveDriverId(e.target.value)
                            }
                        />

                        <div className={styles.modalActions}>
                            <Button
                                text="Cancel"
                                color="secondary"
                                onClick={() => setRemoveDriverOpen(false)}
                            />

                            <Button
                                text="Confirm Remove"
                                color="danger"
                                onClick={() =>
                                {
                                    if (!removeDriverId) return;

                                    removeMutation.mutate({
                                        userId: Number(removeDriverId),
                                        orgId: removeOrgId,
                                    });

                                    setRemoveDriverOpen(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}