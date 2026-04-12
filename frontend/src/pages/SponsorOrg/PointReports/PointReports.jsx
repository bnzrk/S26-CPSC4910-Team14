import { useState, useMemo, useRef, useEffect } from "react";
import { useDriverUsers } from "@/api/driver";
import { useDebounce } from "@/helpers/debounce";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import SearchInput from "@/components/SearchInput/SearchInput";
import styles from "./PointReports.module.scss";
import PageControls from "@/components/PageControls/PageControls";

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
    const pageSize = 10;

    // --- Point tracking query (debounced) ---
    const [userQueryString, setUserQueryString] = useState(null);
    const searchDebounceMs = 200;
    const debouncedQuery = useDebounce(userQueryString, searchDebounceMs);

    // --- Driver search (debounced) ---
    const debouncedDriverSearch = useDebounce(driverSearchQuery, searchDebounceMs);
    const {
        data: driverResult,
        isLoading: isDriversLoading,
        isError: isDriversError,
    } = useDriverUsers({ query: debouncedDriverSearch });

    // Replace with your actual data hook / query that respects selectedDriver + page
    const users = undefined; // placeholder
    const totalCount = users?.totalCount ?? 1;
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
            <Card title='Driver Filter'>
                {/* Driver mode toggle */}
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
            </Card>

            <Card title='Point Tracking'>
                <PageControls
                    page={page}
                    totalPages={totalPages}
                    onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                    onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                    onStart={() => setPage(1)}
                    onEnd={() => setPage(totalPages)}
                />
            </Card>
        </CardHost>
    );
}