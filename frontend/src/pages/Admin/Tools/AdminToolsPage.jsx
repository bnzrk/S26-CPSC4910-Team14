import { useState } from "react";
import { useToast } from "@/components/Toast/ToastContext";
import { useAllSponsorOrgs, useCreateSponsorOrg, useCreateSponsorOrgUser } from "@/api/sponsorOrg";
import { useCreateAdminUser } from "@/api/admin";
import Card from "@/components/Card/Card";
import CardHost from "@/components/CardHost/CardHost";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import styles from './AdminToolsPage.module.scss';
import { useNavigate } from 'react-router-dom';


// Will probably have a proper admin dashboard/pages later but this is fine for now
export default function AdminToolsPage()
{
    const { push } = useToast();

    const { data: orgs, isLoading: isOrgsLoading, isError: isOrgsError } = useAllSponsorOrgs();

    const createOrg = useCreateSponsorOrg();
    const createSponsor = useCreateSponsorOrgUser();
    const createAdmin = useCreateAdminUser();

    const [orgName, setOrgName] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState(1);

    const [sponsorEmail, setSponsorEmail] = useState('');
    const [sponsorFirstName, setSponsorFirstName] = useState('');
    const [sponsorLastName, setSponsorLastName] = useState('');
    const [sponsorPassword, setSponsorPassword] = useState('');
    const [sponsorErrors, setSponsorErrors] = useState([]);

    const [adminEmail, setadminEmail] = useState('');
    const [adminFirstName, setadminFirstName] = useState('');
    const [adminLastName, setadminLastName] = useState('');
    const [adminPassword, setadminPassword] = useState('');
    const [adminErrors, setadminErrors] = useState([]);
    const navigate = useNavigate();
    async function handleCreateOrg()
    {
        if (!orgName)
        {
            push({ type: 'error', message: 'Sponsor organization name empty.' });
            return Promise.reject();
        }

        try
        {
            await createOrg.mutateAsync({ sponsorName: orgName });
            push({ type: 'success', message: 'Sponsor organization successfully created.' });
        }
        catch (err)
        {
            console.log(err);
            push({ type: 'error', message: 'Failed to make sponsor organization.' });
            return Promise.fail();
        }
    }

    async function handleCreateSponsor()
    {
        try
        {
            await createSponsor.mutateAsync({ orgId: selectedOrgId, email: sponsorEmail, firstName: sponsorFirstName, lastName: sponsorLastName, password: sponsorPassword });
            push({ type: 'success', message: 'Sponsor user successfully created.' });
        }
        catch (err)
        {
            console.log(err);
            push({ type: 'error', message: 'Failed to make sponsor user.' });
            return Promise.fail();
        }
    }

    async function handleCreateAdmin()
    {
        try
        {
            await createAdmin.mutateAsync({ email: adminEmail, firstName: adminFirstName, lastName: adminLastName, password: adminPassword });
            push({ type: 'success', message: 'Admin user successfully created.' });
        }
        catch (err)
        {
            console.log(err);
            push({ type: 'error', message: 'Failed to make admin user.' });
            return Promise.fail();
        }
    }

    return (
        <>
            <CardHost title='Admin Tools' subtitle='Admin tools to create and edit data'>
                <Card title='Create Organization'>
                    <form className={styles.form}>
                        <div className={styles.field}>
                            <label htmlFor="orgName" className={styles.label}>Name</label>
                            <input
                                id="orgName"
                                type="orgName"
                                className={styles.input}
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required
                            />
                        </div>
                        <AsyncButton type="submit" text='Create' action={handleCreateOrg} />
                    </form>
                    <Card title='Navigation'>
                        <button onClick={() => navigate('/admin/audit-logs')}>
                            View Audit Logs
                        </button>
                        </Card>
                </Card>
                <Card title='Create Sponsor User'>
                    <select
                        value={selectedOrgId}
                        onChange={(e) => setSelectedOrgId(e.target.value)}
                        disabled={isOrgsLoading || isOrgsError}
                    >
                        {orgs && orgs.length > 0 && orgs.map((org) =>
                            <option key={org.id} value={org.id}>{org.sponsorName}</option>
                        )}
                    </select>
                    <form className={styles.form}>
                        <div className={styles.field}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                value={sponsorEmail}
                                onChange={(e) => setSponsorEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.names}>
                            <div className={styles.field}>
                                <label htmlFor="firstName" className={styles.label}>First Name</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className={styles.input}
                                    value={sponsorFirstName}
                                    onChange={(e) => setSponsorFirstName(e.target.value)}
                                    required
                                    autoComplete="given-name"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="lastName" className={styles.label}>Last Name</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className={styles.input}
                                    value={sponsorLastName}
                                    onChange={(e) => setSponsorLastName(e.target.value)}
                                    required
                                    autoComplete="family-name"
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <input
                                id="password"
                                type="password"
                                className={styles.input}
                                value={sponsorPassword}
                                onChange={(e) => setSponsorPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {sponsorErrors?.length > 0 && (
                            <InlineErrors className={styles.registerErrors} errors={sponsorErrors} />
                        )}
                        <AsyncButton type="submit" text='Create' action={handleCreateSponsor} />
                    </form>
                </Card>
                <Card title='Create Admin User'>
                    <form className={styles.form}>
                        <div className={styles.field}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                value={adminEmail}
                                onChange={(e) => setadminEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.names}>
                            <div className={styles.field}>
                                <label htmlFor="firstName" className={styles.label}>First Name</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className={styles.input}
                                    value={adminFirstName}
                                    onChange={(e) => setadminFirstName(e.target.value)}
                                    required
                                    autoComplete="given-name"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="lastName" className={styles.label}>Last Name</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className={styles.input}
                                    value={adminLastName}
                                    onChange={(e) => setadminLastName(e.target.value)}
                                    required
                                    autoComplete="family-name"
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <input
                                id="password"
                                type="password"
                                className={styles.input}
                                value={adminPassword}
                                onChange={(e) => setadminPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {adminErrors?.length > 0 && (
                            <InlineErrors className={styles.registerErrors} errors={adminErrors} />
                        )}
                        <AsyncButton type="submit" text='Create' action={handleCreateAdmin} />
                    </form>
                </Card>
            </CardHost>
        </>
    )
}