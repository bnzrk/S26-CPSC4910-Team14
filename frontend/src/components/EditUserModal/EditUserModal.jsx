import { useEffect, useState } from "react";
import Button from "@/components/Button/Button";
import styles from "./EditUserModal.module.scss";
import { apiFetch } from "@/api/apiFetch";

export default function EditUserModal({ isOpen, user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                email: user.email ?? "",
            });
        }
        // Reset password section when modal opens/closes
        setShowPasswordSection(false);
        setNewPassword("");
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleSave = async () => {
        await apiFetch(`/admin/users/${user.id}`, {
            method: "PUT",
            body: JSON.stringify(formData),
        });

        onSuccess?.();
    };

    const handleChangePassword = async () => {
        if (!newPassword) return;

        await apiFetch(`/admin/users/${user.id}/password`, {
            method: "POST",
            body: JSON.stringify({ password: newPassword }),
        });

        setShowPasswordSection(false);
        setNewPassword("");
    };

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <h3>Edit User</h3>

                <label className={styles.fieldLabel}>First Name</label>
                <input
                    className={styles.input}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                    }
                />

                <label className={styles.fieldLabel}>Last Name</label>
                <input
                    className={styles.input}
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                    }
                />

                <label className={styles.fieldLabel}>Email</label>
                <input
                    className={styles.input}
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                />

                {/* Password Section */}
                <hr className={styles.divider} />

                {!showPasswordSection ? (
                    <Button
                        text="Change Password"
                        color="secondary"
                        size="small"
                        onClick={() => setShowPasswordSection(true)}
                    />
                ) : (
                    <div className={styles.passwordSection}>
                        <label className={styles.fieldLabel}>New Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div className={styles.passwordActions}>
                            <Button
                                text="Cancel"
                                color="secondary"
                                size="small"
                                onClick={() => {
                                    setShowPasswordSection(false);
                                    setNewPassword("");
                                }}
                            />
                            <Button
                                text="Update Password"
                                color="primary"
                                size="small"
                                onClick={handleChangePassword}
                            />
                        </div>
                    </div>
                )}

                <hr className={styles.divider} />

                <div className={styles.actions}>
                    <Button text="Cancel" color="secondary" onClick={onClose} />
                    <Button text="Save" color="primary" onClick={handleSave} />
                </div>
            </div>
        </div>
    );
}