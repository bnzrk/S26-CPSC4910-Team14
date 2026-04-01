import { useState } from "react";
import { useDebounce } from "@/helpers/debounce";
import { useUsers } from "@/api/users";
import { useStartImpersonation } from "@/api/auth";
import { USER_TYPE_ENUM } from "@/constants/userTypes";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import Button from "@/components/Button/Button";
import ListItem from "@/components/ListItem/ListItem";
import UserTypeBadge from "@/components/UserTypeBadge/UserTypeBadge";
import PageControls from "@/components/PageControls/PageControls";
import SearchInput from "@/components/SearchInput/SearchInput";
import UsersIcon from "@/assets/icons/users.svg?react";
import LoginIcon from "@/assets/icons/log-in.svg?react";
import TruckIcon from "@/assets/icons/truck.svg?react";
import WrenchIcon from "@/assets/icons/wrench.svg?react";
import BuildingIcon from "@/assets/icons/building-2.svg?react";
import UserIcon from "@/assets/icons/user.svg?react";
import styles from "./UsersPage.module.scss"
import clsx from "clsx";

export default function UsersPage()
{
    const searchDebounceMs = 200;
    const [userQueryString, setUserQueryString] = useState(null);
    const debouncedQuery = useDebounce(userQueryString, searchDebounceMs);

    const { data: users, isLoading: isUsersLoading, isError: isUsersError } = useUsers({ pageSize: 12, query: debouncedQuery });
    const { mutate: impersonate, isPending: isImpersonatePending } = useStartImpersonation();

    return (
        <CardHost>
            <Card title='Users' icon={UsersIcon}>
                <SearchInput
                    placeholder="Search users..."
                    onChange={(e) => setUserQueryString(e.target.value)}
                />
                {users && users.items.map((user) => (
                    <ListItem
                        key={user.id}
                        icon={UserIcon}
                        label={`${user.firstName} ${user.lastName}`}
                        right={user.userType != USER_TYPE_ENUM.ADMIN &&
                            <Button
                                size='small'
                                className={clsx(styles.userItemButton)}
                                icon={LoginIcon}
                                text='Login-As'
                                disabled={isImpersonatePending}
                                onClick={() => impersonate({ targetUserId: user.id })}
                            />
                        }
                    >
                        <p className={styles.userEmail}>{user.email}</p>
                        <UserTypeBadge type={user.userType} showIcon={true} />
                    </ListItem>
                ))}
                {(!users || users.items.length == 0) &&
                    <p>No results found</p>
                }
            </Card>
        </CardHost>
    );
}