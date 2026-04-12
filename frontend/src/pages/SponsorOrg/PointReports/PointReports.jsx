import { useState, useMemo, useRef, useEffect } from "react";
import { useDriverUsers } from "@/api/driver";
import { usePointTransactions } from "@/api/pointTransaction";
import { useDebounce } from "@/helpers/debounce";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import { DownloadIcon } from "lucide-react";
import TextInput from "@/components/TextInput/TextInput";
import SearchInput from "@/components/SearchInput/SearchInput";
import PageControls from "@/components/PageControls/PageControls";
import styles from "./PointReports.module.scss";
import clsx from "clsx";
import Button from "@/components/Button/Button";

function formatDate(dateStr)
{
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
}

function exportToCSV(transactions)
{
  if (!transactions || transactions.length === 0) return;

  const headers = Object.keys(transactions[0]);
  const rows = transactions.map(t => headers.map(h => JSON.stringify(t[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `point-logs-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PointReports()
{
    // --- Driver filter state ---
    const [driverMode, setDriverMode] = useState("all");
    const [driverSearchQuery, setDriverSearchQuery] = useState("");
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // --- Pagination state ---
    const [page, setPage] = useState(1);
    const pageSize = 6;

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    // --- Driver search (debounced) ---
    const searchDebounceMs = 200;
    const debouncedDriverSearch = useDebounce(driverSearchQuery, searchDebounceMs);
    const {
        data: driverResult,
        isLoading: isDriversLoading,
        isError: isDriversError,
    } = useDriverUsers({ query: debouncedDriverSearch });

    // --- Point tracking ---
    const {
        data: pointTransactionsResult,
        isLoading: isPointTransactionsLoading,
        isError: isPointTransactionsError
    } = usePointTransactions({
        driverId: selectedDriver?.id ?? undefined,
        from,
        to,
        page,
        pageSize
    });

    const transactions = pointTransactionsResult?.items ?? [];
    const totalCount = pointTransactionsResult?.totalCount ?? 1;
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
            {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleDriverModeChange(mode)
    {
        setDriverMode(mode);
        if (mode === "all")
        {
            setSelectedDriver(null);
            setDriverSearchQuery("");
            setDropdownOpen(false);
        }
        setPage(1);
    }

    function handleDriverSelect(driver)
    {
        setSelectedDriver(driver);
        setDriverSearchQuery("");
        setDropdownOpen(false);
        setPage(1);
    }

    function handleClearDriver()
    {
        setSelectedDriver(null);
        setDriverSearchQuery("");
        setPage(1);
    }

    const driverItems = driverResult?.items ?? [];
    const showDropdown = dropdownOpen && driverMode === "individual";

    return (
        <CardHost>
            <Card title='Filters'>
                <div className={styles.filters}>
                    {/* Driver mode toggle */}
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

                        {/* Driver search — only shown in individual mode */}
                        {driverMode === "individual" && (
                            <div className={styles.driverSearchWrapper}>
                                {/* Search input — always visible in individual mode */}
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
                                {/* Selected driver badge — shown above search when a driver is selected */}
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
            </Card>

            <Card title='Point Transactions' headerRight={
                <Button
                    text='Export CSV'
                    icon={DownloadIcon}
                    color='secondary'
                    size='small'
                    onClick={() => exportToCSV(transactions)}
                    disabled={!transactions || transactions?.length == 0}
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
                    {transactions && transactions?.length != 0 &&
                        <table className={styles.transactionTable}>
                            <tbody>
                                <tr>
                                    <th>Driver Name</th>
                                    <th>Sponsor</th>
                                    <th>Total Points</th>
                                    <th>Point Change</th>
                                    <th>Change Reason</th>
                                    <th>Change Date</th>
                                </tr>
                                {transactions.map((t) =>
                                    <tr>
                                        <td>{t.driverName}</td>
                                        <td>{t.sponsorName}</td>
                                        <td>{t.driverTotalPoints}</td>
                                        <td>{t.balanceChange}</td>
                                        <td>{t.reason}</td>
                                        <td>{formatDate(t.transactionDateUtc)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    }
                    {!isPointTransactionsLoading && (!transactions || transactions?.length == 0) &&
                        <p>No transactions found.</p>
                    }
                </PageControls>
            </Card>
        </CardHost>
    );
}