import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import Select from '../Select/Select';
import BuildingIcon from '@/assets/icons/building-2.svg?react';
import styles from './OrgSelector.module.scss';
import clsx from 'clsx';

export default function OrgSelector({ className, ...other })
{
    const { driverOrgs, selectedOrgId, setSelectedOrgId } = useOrgContext();
    const orgs = driverOrgs ?? [];

    return (
        <Select
            {...other}
            value={selectedOrgId}
            onChange={setSelectedOrgId}
            className={clsx(className, styles.orgSelect)}
        >
            <Select.Trigger className={styles.trigger} icon={BuildingIcon} />
            <Select.Content className={styles.content}>
                {orgs && orgs.map((org) => (
                    <Select.Option key={org.id} value={org.id} className={styles.option}>{org.sponsorName}</Select.Option>
                ))}
            </Select.Content>
        </Select>
    );
}