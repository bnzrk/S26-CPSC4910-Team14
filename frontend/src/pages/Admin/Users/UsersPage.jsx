import { useState, useMemo } from "react";
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
import CreateUserModal from "@/components/CreateUserModal/CreateUserModal";
import PlusIcon from '@/assets/icons/plus.svg?react';
import TruckIcon from "@/assets/icons/truck.svg?react";
import WrenchIcon from "@/assets/icons/wrench.svg?react";
import BuildingIcon from "@/assets/icons/building-2.svg?react";
import UserIcon from "@/assets/icons/user.svg?react";
import styles from "./UsersPage.module.scss"
import clsx from "clsx";
import { assignDriverToOrg, removeDriverFromOrg } from "@/api/admin";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/Toast/ToastContext";

export default function UsersPage()
{
    const modals = {
        createUser: 'createUser',
    };
    const [activeModal, setActiveModal] = useState(null);

    const searchDebounceMs = 200;
    const [userQueryString, setUserQueryString] = useState(null);
    const debouncedQuery = useDebounce(userQueryString, searchDebounceMs);

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data: users, isLoading: isUsersLoading, isError: isUsersError } = useUsers({ pageSize, page, query: debouncedQuery });
    const { mutate: impersonate, isPending: isImpersonatePending } = useStartImpersonation();

    const totalCount = users?.totalCount ?? 1;
    const totalPages = useMemo(() =>
    {
        if (!totalCount) return 1;
        return Math.max(1, Math.ceil(totalCount / pageSize));
    }, [totalCount, pageSize]);

    const onPrev = () =>
    {
        setPage(page > 1 ? page - 1 : 1);
    }

    const onNext = () =>
    {
        setPage(page < totalPages ? page + 1 : totalPages);
    }

    const onStart = () =>
    {
        setPage(1);
    }

    const onEnd = () =>
    {
        setPage(totalPages);
    }

    const { push } = useToast();
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const assignMutation = useMutation({
        mutationFn: ({ userId, orgId }) => assignDriverToOrg(userId, orgId),
        onSuccess: () => push({ type: "success", message: "Driver added to org" }),
        onError: () => push({ type: "error", message: "Failed to add driver" }),
    });
      
    const removeMutation = useMutation({
        mutationFn: (userId) => removeDriverFromOrg(userId),
        onSuccess: () => {
            push({ type: "success", message: "Driver removed from org" });
            queryClient.invalidateQueries(['users']);   //refresh list
        },
        onError: () => push({ type: "error", message: "Failed to remove driver" }),
    });

    return (
        <>
            <CreateUserModal
                isOpen={activeModal === modals.createUser}
                onClose={() => setActiveModal(null)}
                onSuccess={() => setActiveModal(null)}
            />
            <CardHost>
                <Card title='Users' icon={UsersIcon} headerRight={
                    <Button
                        text="New"
                        color="secondary"
                        size='small'
                        icon={PlusIcon}
                        onClick={() => setActiveModal(modals.createUser)}
                    />
                }>
                    <SearchInput
                        placeholder="Search users..."
                        onChange={(e) => setUserQueryString(e.target.value)}
                    />
                    <PageControls
                        className={styles.userResults}
                        showBookends={true}
                        page={page}
                        totalPages={totalPages}
                        onPrev={onPrev}
                        onNext={onNext}
                        onStart={onStart}
                        onEnd={onEnd}
                    >
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

                                {/* Adding the add/remove org for user accounts */}
                                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                <input
                                    type="number"
                                    placeholder="Org ID"
                                    value={selectedOrgId}
                                    onChange={(e) => setSelectedOrgId(e.target.value)}
                                    style={{ width: "90px" }}
                                />
                                <Button
                                    size="small"
                                    text="Add"
                                    onClick={() =>
                                        assignMutation.mutate({
                                            userId: user.id,
                                            orgId: Number(selectedOrgId),
                                        })
                                    }
                                />
                                <Button
                                    size="small"
                                    text="Remove"
                                    color="secondary"
                                    onClick={() => removeMutation.mutate(user.id)}
                                />
                                </div>
                            </ListItem>
                        ))}
                        {(!users || users.items.length == 0) &&
                            <p>No results found</p>
                        }
                    </PageControls>
                </Card>
            </CardHost>
        </>
    );
}