import { useToast } from "@/components/Toast/ToastContext";
import { useState, useMemo, useRef, useEffect } from "react";
import { useDriverUsers } from "@/api/driver";
import { useDebounce } from "@/helpers/debounce";
import { apiFetch } from "@/api/apiFetch";
import { queryClient } from "@/api/queryClient";
import { useAllSponsorOrgs } from "@/api/sponsorOrg";
import { useSales } from "@/api/sales";
import { formatUsd } from "@/helpers/formatting";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import { DownloadIcon } from "lucide-react";
import TextInput from "@/components/TextInput/TextInput";
import SearchInput from "@/components/SearchInput/SearchInput";
import PageControls from "@/components/PageControls/PageControls";
import Button from "@/components/Button/Button";
import styles from "./SalesReports.module.scss";
import clsx from "clsx";

function formatDate(dateStr)
{
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
}

async function exportToCSV({ orgId, driverId, from, to, recordCount })
{
    const params = new URLSearchParams();
    if (orgId)
        params.append("orgId", orgId);
    if (driverId)
        params.append("driverId", driverId);
    if (to)
        params.append("to", to);
    if (from)
        params.append("from", from);
    params.append("page", 1);
    params.append("pageSize", recordCount);

    const result = await queryClient.fetchQuery({
        queryKey: ['sales', orgId, driverId, from, to, 1, recordCount],
        queryFn: async () => apiFetch(`/sales?${params.toString()}`).then(r => r.json()),
        staleTime: 0,
        gcTime: 0
    });

    const sales = result?.items ?? [];
    if (!sales || sales?.length == 0)
        throw new Error("Could not fetch full sales.");

    const headers = Object.keys(sales[0]);
    const rows = sales.map(t => headers.map(h => JSON.stringify(t[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function SalesReports()
{
    const { push } = useToast();

    const { data: orgs, isLoading: isOrgsLoading, isError: isOrgsError } = useAllSponsorOrgs();

    // --- Pending filter state (what the user is editing) ---
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [driverMode, setDriverMode] = useState("all");
    const [driverSearchQuery, setDriverSearchQuery] = useState("");
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const dropdownRef = useRef(null);

    // --- Applied filter state (what the query actually uses) ---
    const [appliedFilters, setAppliedFilters] = useState({
        orgId: "",
        driverId: undefined,
        from: "",
        to: "",
    });

    const [isExporting, setIsExporting] = useState(false);

    // --- Pagination state ---
    const [page, setPage] = useState(1);
    const pageSize = 6;

    // --- Driver search (debounced) ---
    const searchDebounceMs = 200;
    const debouncedDriverSearch = useDebounce(driverSearchQuery, searchDebounceMs);
    const {
        data: driverResult,
        isLoading: isDriversLoading,
        isError: isDriversError,
    } = useDriverUsers({ query: debouncedDriverSearch });

    // --- Point tracking (uses applied filters only) ---
    const {
        data: salesResult,
        isLoading: isSalesLoading,
        isError: isSalesError
    } = useSales({
        orgId: appliedFilters.orgId,
        driverId: appliedFilters.driverId,
        from: appliedFilters.from,
        to: appliedFilters.to,
        page,
        pageSize
    });

    const sales = salesResult?.items ?? [];
    const totalCount = salesResult?.totalCount ?? 1;
    const totalPages = useMemo(() =>
    {
        if (!totalCount) return 1;
        return Math.max(1, Math.ceil(totalCount / pageSize));
    }, [totalCount, pageSize]);

    // Close dropdown when clicking outside
    useEffect(() =>
    {
        function handleClickOutside(e)
        {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setDropdownOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleApplyFilters()
    {
        setAppliedFilters({
            orgId: selectedOrgId,
            driverId: selectedDriver?.id ?? undefined,
            from,
            to,
        });
        setPage(1);
    }

    function handleDriverModeChange(mode)
    {
        setDriverMode(mode);
        if (mode === "all")
        {
            setSelectedDriver(null);
            setDriverSearchQuery("");
            setDropdownOpen(false);
        }
    }

    function handleDriverSelect(driver)
    {
        setSelectedDriver(driver);
        setDriverSearchQuery("");
        setDropdownOpen(false);
    }

    function handleClearDriver()
    {
        setSelectedDriver(null);
        setDriverSearchQuery("");
    }

    async function handleExport()
    {
        setIsExporting(true);
        try
        {
            await exportToCSV({ orgId: appliedFilters.orgId, driverId: appliedFilters.driverId, from: appliedFilters.from, to: appliedFilters.to, recordCount: totalCount });
        }
        catch (ex)
        {
            push({ type: "error", message: ex.message });
        }
        finally
        {
            setIsExporting(false);
        }
    }

    function handleClearFilters()
    {
        setDriverMode("all");
        setSelectedDriver(null);
        setSelectedOrgId("");
        setDriverSearchQuery("");
        setFrom("");
        setTo("");
        setAppliedFilters({ orgId: "", driverId: undefined, from: "", to: "" });
        setPage(1);
    }

    const driverItems = driverResult?.items ?? [];
    const showDropdown = dropdownOpen && driverMode === "individual";

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
                    <div className={clsx(styles.orgSelect, styles.filterGroup)}>
                        <label>Organization</label>
                        <select
                            className={styles.orgSelect}
                            value={selectedOrgId}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
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
                    {/* Driver mode toggle */}
                    <div className={styles.filterRow}>
                        <div className={styles.filterGroup}>
                            <label>Driver</label>
                            <div className={styles.filterToggleGroup}>
                                <button
                                    className={`${styles.filterToggleBtn} ${driverMode === "all" ? styles.filterToggleBtnActive : ""}`}
                                    onClick={() => handleDriverModeChange("all")}
                                    type="button"
                                >
                                    All
                                </button>
                                <button
                                    className={`${styles.filterToggleBtn} ${driverMode === "individual" ? styles.filterToggleBtnActive : ""}`}
                                    onClick={() => handleDriverModeChange("individual")}
                                    type="button"
                                >
                                    Individual
                                </button>
                            </div>

                            {driverMode === "individual" && (
                                <div className={styles.driverSearchWrapper}>
                                    <div className={styles.driverDropdown} ref={dropdownRef}>
                                        <SearchInput
                                            value={driverSearchQuery}
                                            onChange={(e) =>
                                            {
                                                setDriverSearchQuery(e.target.value);
                                                setDropdownOpen(true);
                                            }}
                                            onFocus={() => setDropdownOpen(true)}
                                            placeholder="Search drivers..."
                                        />
                                        {showDropdown && (
                                            <div className={styles.driverResultsList}>
                                                {isDriversLoading && (
                                                    <div className={styles.driverResultEmpty}>Loading...</div>
                                                )}
                                                {isDriversError && (
                                                    <div className={styles.driverResultEmpty}>Error loading drivers.</div>
                                                )}
                                                {!isDriversLoading && !isDriversError && driverItems.length === 0 && (
                                                    <div className={styles.driverResultEmpty}>No drivers found.</div>
                                                )}
                                                {!isDriversLoading && driverItems.map((driver) => (
                                                    <div
                                                        key={driver.id}
                                                        className={styles.driverResultItem}
                                                        onMouseDown={() => handleDriverSelect(driver)}
                                                    >
                                                        {driver.email}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {selectedDriver && (
                                        <span className={styles.driverSelectedBadge}>
                                            {selectedDriver.email}
                                            <button
                                                className={styles.driverSelectedBadgeClear}
                                                onClick={handleClearDriver}
                                                type="button"
                                                aria-label="Clear selected driver"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
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

            <Card title={`Sales (${totalCount ?? ''})`} headerRight={
                <Button
                    text='Export CSV'
                    icon={DownloadIcon}
                    color='secondary'
                    size='small'
                    onClick={handleExport}
                    disabled={isExporting || !sales || sales?.length == 0}
                />
            }>
                <PageControls
                    page={page}
                    totalPages={totalPages}
                    onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                    onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                    onStart={() => setPage(1)}
                    onEnd={() => setPage(totalPages)}
                    showBookends={true}
                >
                    {sales && sales?.length != 0 &&
                        <table className={styles.salesTable}>
                            <tbody>
                                <tr>
                                    <th>Sponsor</th>
                                    <th>Driver Name</th>
                                    <th>Driver Email</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                </tr>
                                {sales.map((t, i) =>
                                    <tr key={i}>
                                        <td>{t.sponsorName}</td>
                                        <td>{t.driverName}</td>
                                        <td>{t.driverEmail}</td>
                                        <td>{formatDate(t.saleDateUtc)}</td>
                                        <td>{formatUsd(t.totalUsd)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    }
                    {!isSalesLoading && (!sales || sales?.length == 0) &&
                        <p>No sales found.</p>
                    }
                </PageControls>
            </Card>
        </CardHost>
    );
}