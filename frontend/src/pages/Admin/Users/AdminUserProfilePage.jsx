import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import Button from "@/components/Button/Button";
import UserTypeBadge from "@/components/UserTypeBadge/UserTypeBadge";
import EditUserModal from "@/components/EditUserModal/EditUserModal";

import styles from "./AdminUserProfilePage.module.scss";

import { useToast } from "@/components/Toast/ToastContext";
import { apiFetch } from "@/api/apiFetch";

export default function AdminUserProfilePage() {
    const { userId } = useParams();
    const queryClient = useQueryClient();
    const { push } = useToast();

    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    const { data: user, isLoading } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => apiFetch(`/admin/users/${userId}`),
        enabled: !!userId,
    });

    const passwordMutation = useMutation({
        mutationFn: ({ userId, password }) =>
            apiFetch(`/admin/users/${userId}/password`, {
                method: "POST",
                body: JSON.stringify({ password }),
            }),
        onSuccess: () => {
            push({ type: "success", message: "Password updated successfully" });
            setPasswordOpen(false);
            setNewPassword("");
        },
        onError: () => {
            push({ type: "error", message: "Failed to update password" });
        },
    });

    return (
        <>
            <CardHost>
                <Card
                    title="User Profile"
                    headerRight={
                        <Button
                            text="Edit User"
                            color="secondary"
                            size="small"
                            disabled={!user}
                            onClick={() => setEditOpen(true)}
                        />
                    }
                >
                    {isLoading && <p>Loading user...</p>}

                    {user && (
                        <div className={styles.profile}>
                            <div className={styles.field}>
                                <span className={styles.label}>First Name</span>
                                <span>{user.firstName}</span>
                            </div>
                            <div className={styles.field}>
                                <span className={styles.label}>Last Name</span>
                                <span>{user.lastName}</span>
                            </div>
                            <div className={styles.field}>
                                <span className={styles.label}>Email</span>
                                <span className={styles.email}>{user.email}</span>
                            </div>
                            <div className={styles.field}>
                                <span className={styles.label}>User Type</span>
                                <UserTypeBadge type={user.userType} />
                            </div>
                        </div>
                    )}   
                </Card>
            </CardHost>

            {/* EDIT MODAL */}
            <EditUserModal
                isOpen={editOpen}
                user={user}
                onClose={() => setEditOpen(false)}
                onSuccess={() => {
                    setEditOpen(false);
                    queryClient.invalidateQueries(["user", userId]);
                }}
            />

            {/* PASSWORD MODAL */}
            {passwordOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <h3>Change Password</h3>

                        <input
                            className={styles.input}
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <div className={styles.modalActions}>
                            <Button
                                text="Cancel"
                                color="secondary"
                                onClick={() => setPasswordOpen(false)}
                            />

                            <Button
                                text="Update"
                                color="primary"
                                onClick={() => {
                                    if (!newPassword) return;

                                    passwordMutation.mutate({
                                        userId,
                                        password: newPassword,
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}