import { useToast } from "@/components/Toast/ToastContext";
import { useState, useEffect } from "react";
import { useAllSponsorOrgs } from "@/api/sponsorOrg";
import { useInvoices } from "@/api/sales";
import { formatUsd } from "@/helpers/formatting";
import Invoice from "./components/Invoice";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import { DownloadIcon } from "lucide-react";
import TextInput from "@/components/TextInput/TextInput";
import Button from "@/components/Button/Button";
import styles from "./InvoicesPage.module.scss";
import clsx from "clsx";

function formatDate(dateStr)
{
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
}

function exportToCSV({ invoices, rangeFrom, rangeTo })
{
    if (!invoices || !(invoices?.length > 0))
        return;

    function formatDate(dateStr)
    {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US');
    }

    function escapeCell(value)
    {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n'))
        {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    const rows = [];

    for (const invoice of invoices)
    {
        const sponsorName = invoice?.sponsorOrgName ?? 'Unavailable';

        // Bill To row
        rows.push(['Bill To:', escapeCell(sponsorName)]);

        // Date range row
        if (rangeFrom && rangeTo)
        {
            rows.push(['Period:', `${formatDate(rangeFrom)} to ${formatDate(rangeTo)}`]);
        } else if (rangeFrom && !rangeTo)
        {
            rows.push(['Period:', `From ${formatDate(rangeFrom)}`]);
        } else if (!rangeFrom && rangeTo)
        {
            rows.push(['Period:', `Until ${formatDate(rangeTo)}`]);
        } else
        {
            rows.push(['Period:', 'Lifetime']);
        }

        rows.push([]); // blank spacer row

        // Table header
        rows.push(['Driver Name', 'Driver Email', 'Fees']);

        // Driver rows
        for (const driver of (invoice.driverFees ?? []))
        {
            rows.push([
                escapeCell(driver.name),
                escapeCell(driver.email),
                escapeCell(formatUsd(driver.feeUsd)),
            ]);
        }

        // Total row
        rows.push(['', 'Total Fee:', escapeCell(formatUsd(invoice.totalFeeUsd))]);

        rows.push([]); // blank spacer between invoices if multiple
        rows.push([]);
    }

    const csv = rows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice${invoices.length > 1 ? 's' : ''}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function InvoicesPage()
{
    const { push } = useToast();
    const { data: orgs, isLoading: isOrgsLoading, isError: isOrgsError } = useAllSponsorOrgs();

    // --- Pending filter state (what the user is editing) ---
    const [selectedFilterOrgId, setSelectedFilterOrgId] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    // --- Applied filter state (what the query actually uses) ---
    const [appliedFilters, setAppliedFilters] = useState({
        orgId: "",
        from: "",
        to: "",
    });

    const {
        data: invoices,
        isLoading: isInvoicesLoading,
        isError: isInvoicesError
    } = useInvoices({
        orgId: appliedFilters.orgId,
        from: appliedFilters.from,
        to: appliedFilters.to
    });

    const invoiceOrgs = invoices
        ? invoices.map(i => ({
            id: i.sponsorOrgId,
            name: i.sponsorOrgName
        }))
        : [];

    const [selectedInvoiceOrgId, setSelectedInvoiceOrgId] = useState("");

    // Reset the selected invoice org whenever the fetched invoices change
    useEffect(() =>
    {
        if (invoiceOrgs.length > 0)
        {
            setSelectedInvoiceOrgId(invoiceOrgs[0].id);
        } else
        {
            setSelectedInvoiceOrgId("");
        }
    }, [invoices]); // depend on invoices, not invoiceOrgs (that's derived — would cause loops)

    const selectedInvoice = appliedFilters.orgId
        ? (invoices?.[0] ?? null)
        : (invoices?.find(i => i.sponsorOrgId == selectedInvoiceOrgId) ?? null);

    function handleApplyFilters()
    {
        setAppliedFilters({
            orgId: selectedFilterOrgId,
            from,
            to,
        });
    }

    function handleClearFilters()
    {
        setSelectedInvoiceOrgId(invoiceOrgs && invoiceOrgs?.length > 0 ? invoiceOrgs[0].id : null);
        setSelectedFilterOrgId("");
        setFrom("");
        setTo("");
        setAppliedFilters({ orgId: "", from: "", to: "" });
    }

    return (
        <CardHost>
            <Card
                title='Filters'
                headerRight={
                    <div className={styles.filterActions}>
                        <Button
                            text='Clear'
                            color='secondary'
                            size='small'
                            onClick={handleClearFilters}
                        />
                        <Button
                            text='Apply'
                            color='primary'
                            size='small'
                            onClick={handleApplyFilters}
                        />
                    </div>
                }
            >
                <div className={styles.filters}>
                    {/* Driver mode toggle */}
                    <div className={styles.filterRow}>
                        <div className={clsx(styles.orgSelect, styles.filterGroup)}>
                            <label>Sponsor</label>
                            <select
                                className={styles.orgSelect}
                                value={selectedFilterOrgId}
                                onChange={(e) => setSelectedFilterOrgId(e.target.value)}
                                disabled={isOrgsLoading || isOrgsError}
                            >
                                <option key={-1} value={""}>
                                    All
                                </option>
                                {orgs && orgs.length > 0 && orgs.map((org) =>
                                    <option key={org.id} value={org.id}>{org.sponsorName}</option>
                                )}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Date Range</label>
                            <div className={styles.dateRange}>
                                <TextInput
                                    type="date"
                                    label="From"
                                    className={styles.filterInput}
                                    value={from}
                                    onChange={e => setFrom(e.target.value)}
                                />
                                <TextInput
                                    type="date"
                                    label="To"
                                    className={styles.filterInput}
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title={`Invoice`} headerRight={
                <Button
                    text='Export CSV'
                    icon={DownloadIcon}
                    color='secondary'
                    size='small'
                    onClick={() => exportToCSV({ invoices, rangeFrom: from, rangeTo: to })}
                    disabled={!invoices || invoices?.length == 0}
                />
            }>
                {!appliedFilters?.orgId &&
                    <div className={clsx(styles.filterGroup)}>
                        <select
                            className={styles.orgSelect}
                            value={selectedInvoiceOrgId}
                            onChange={(e) => setSelectedInvoiceOrgId(e.target.value)}
                            disabled={isOrgsLoading || isOrgsError}
                        >
                            {invoiceOrgs && invoiceOrgs.length > 0 && invoiceOrgs.map((org) =>
                                <option key={org.id} value={org.id}>{org.name}</option>
                            )}
                        </select>
                    </div>
                }

                <div className={styles.invoiceBody}>
                    {selectedInvoice &&
                        <Invoice invoice={selectedInvoice} invoiceRangeFrom={from} invoiceRangeTo={to} />
                    }
                </div>

                {!isInvoicesLoading && !selectedInvoice &&
                    <p>No invoices generated.</p>
                }
            </Card>
        </CardHost>
    );
}