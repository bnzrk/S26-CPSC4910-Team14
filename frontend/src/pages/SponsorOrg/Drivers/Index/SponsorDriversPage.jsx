import { useSponsorOrgDrivers } from "@/api/sponsorOrg";
import { useNavigate } from "react-router-dom";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import ListItem from "@/components/ListItem/ListItem";
import TruckIcon from '@/assets/icons/truck.svg?react';
import styles from './SponsorDriversPage.module.scss'

export default function SponsorDriversPage()
{
    const navigate = useNavigate();

    const { data: drivers, driversLoading, driversError } = useSponsorOrgDrivers();

    return (
        <main className={styles.sponsorDrivers}>
            <CardHost title='Drivers' subtitle="Manage your organization's drivers">
                <Card title='Accounts'>
                    {drivers && drivers.items.map((driver) => (
                        <ListItem key={driver.id}
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
        </main>
    );
}