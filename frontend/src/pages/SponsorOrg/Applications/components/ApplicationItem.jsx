import { useState } from "react";
import { FileUserIcon } from "lucide-react";
import Button from "@/components/Button/Button";
import styles from "./ApplicationItem.module.scss";

function formatStatus(status)
{
    if (status === null || status === undefined) return "Unknown";
    if (typeof status === "string") return status;
    switch (status)
    {
        case 0: return "Pending";
        case 1: return "Accepted";
        case 2: return "Rejected";
        default: return "Unknown";
    }
}

function formatDate(value)
{
    if (!value) return "No date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No date";
    return date.toLocaleDateString();
}

function getDriverName(application)
{
    const first = application.firstName?.trim() ?? "";
    const last = application.lastName?.trim() ?? "";
    const full = `${first} ${last}`.trim();
    return full || "Unnamed Driver";
}

export default function ApplicationItem({ application, onAccept, onReject, isAcceptDisabled, isRejectDisabled })
{
    const [isExpanded, setIsExpanded] = useState(false);
    const statusLabel = formatStatus(application.status);

    function handleAccept(e)
    {
        e.stopPropagation();
        onAccept();
    }

    function handleReject(e)
    {
        e.stopPropagation();
        onReject();
    }

    return (
        <div className={`${styles.applicationItem} ${isExpanded ? styles.expanded : ""}`}>
            <div
                className={styles.applicationSummary}
                onClick={() => setIsExpanded(prev => !prev)}
            >
                <div className={styles.summarySide}>
                    <div className={styles.left}>
                        <FileUserIcon />
                        <div className={styles.summaryMain}>
                            <div className={styles.summaryName}>{getDriverName(application)}</div>
                            <div className={styles.summaryDate}>
                                Submitted: {formatDate(application.createdAt || application.dateCreated)}
                            </div>
                        </div>
                    </div>

                    {/* <span className={`${styles.statusBadge} ${styles[`status${statusLabel}`]}`}>
                        {statusLabel}
                    </span> */}
                </div>
                <div className={styles.summaryActions}>
                    <Button
                        text='Reject'
                        type='button'
                        color='warn'
                        size='small'
                        className={styles.actionButton}
                        disabled={isRejectDisabled}
                        onClick={handleReject}
                    />
                    <Button
                        text='Accept'
                        type='button'
                        color='primary'
                        size='small'
                        className={styles.actionButton}
                        disabled={isAcceptDisabled}
                        onClick={handleAccept}
                    />
                </div>
            </div>

            {isExpanded && (
                <div className={styles.applicationDetails}>
                    <p className={styles.sectionTitle}>Personal Information</p>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>First Name</span>
                            <span className={styles.detailValue}>{application.firstName || "-"}</span>
                        </div>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>Last Name</span>
                            <span className={styles.detailValue}>{application.lastName || "-"}</span>
                        </div>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>Phone Number</span>
                            <span className={styles.detailValue}>{application.phoneNumber || "-"}</span>
                        </div>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>Birthday</span>
                            <span className={styles.detailValue}>{application.birthday || "-"}</span>
                        </div>
                    </div>

                    <p className={styles.sectionTitle}>Employment</p>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>Previously Employed</span>
                            <span className={styles.detailValue}>
                                {application.previousEmployee === null || application.previousEmployee === undefined
                                    ? "-"
                                    : application.previousEmployee ? "Yes" : "No"}
                            </span>
                        </div>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>Current Status</span>
                            <span className={styles.detailValue}>{statusLabel}</span>
                        </div>
                        {application.rejectionReason && (
                            <div className={styles.detailBlock}>
                                <span className={styles.detailLabel}>Rejection Reason</span>
                                <span className={styles.detailValue}>{application.rejectionReason}</span>
                            </div>
                        )}
                    </div>

                    <p className={styles.sectionTitle}>Truck Information</p>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>Truck Make</span>
                            <span className={styles.detailValue}>{application.truckMake || "-"}</span>
                        </div>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>Truck Model</span>
                            <span className={styles.detailValue}>{application.truckModel || "-"}</span>
                        </div>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>Truck Year</span>
                            <span className={styles.detailValue}>{application.truckYear || "-"}</span>
                        </div>
                        <div className={styles.detailBlock}>
                            <span className={styles.detailLabel}>License Plate</span>
                            <span className={styles.detailValue}>{application.licensePlate || "-"}</span>
                        </div>
                    </div>
                    <div className={styles.inlineActions}>
                        <Button
                            text='Reject'
                            type='button'
                            color='warn'
                            size='small'
                            className={styles.actionButton}
                            disabled={isRejectDisabled}
                            onClick={handleReject}
                        />
                        <Button
                            text='Accept'
                            type='button'
                            color='primary'
                            size='small'
                            className={styles.actionButton}
                            disabled={isAcceptDisabled}
                            onClick={handleAccept}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}