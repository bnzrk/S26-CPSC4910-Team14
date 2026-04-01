import { USER_TYPE_ENUM } from "@/constants/userTypes";
import DriverIcon from "@/assets/icons/truck.svg?react";
import SponsorIcon from "@/assets/icons/handshake.svg?react";
import AdminIcon from "@/assets/icons/wrench.svg?react";
import styles from "./UserTypeBadge.module.scss";
import clsx from "clsx";

const userTypeIcon = (type) =>
{
    switch (type)
    {
        case USER_TYPE_ENUM.DRIVER:
            return DriverIcon;
        case USER_TYPE_ENUM.SPONSOR:
            return SponsorIcon;
        case USER_TYPE_ENUM.ADMIN:
            return AdminIcon;
        default:
            return undefined;
    }
}

const userTypeName = (type) =>
{
    switch (type)
    {
        case USER_TYPE_ENUM.DRIVER:
            return "Driver";
        case USER_TYPE_ENUM.SPONSOR:
            return "Sponsor";
        case USER_TYPE_ENUM.ADMIN:
            return "Admin";
        default:
            return "Invalid";
    }
}

const userTypeStyle = (type) =>
{
    switch (type)
    {
        case USER_TYPE_ENUM.DRIVER:
            return styles.driver;
        case USER_TYPE_ENUM.SPONSOR:
            return styles.sponsor;
        case USER_TYPE_ENUM.ADMIN:
            return styles.admin;
        default:
            return '';
    }
}

export default function UserTypeBadge({ type, showIcon = false })
{
    const style = userTypeStyle(type);
    const Icon = userTypeIcon(type);

    return (
        <span className={clsx(styles.badge, style)}>
            {showIcon && <Icon />}
            {userTypeName(type)}
        </span>
    );
}