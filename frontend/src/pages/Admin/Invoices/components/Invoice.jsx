import { formatUsd } from "@/helpers/formatting.js";
import styles from "./Invoice.module.scss";

function formatDate(date)
{
    return new Date(date).toLocaleDateString('en-US');
}

export default function Invoice({ invoice, invoiceRangeFrom, invoiceRangeTo, other })
{
    const sponsorName = invoice?.sponsorOrgName ?? "Unavailable";
    return (
        <div className={styles.invoice} {...other}>
            <div className={styles.header}>
                <div className={styles.section}>
                    <span><b>Bill To:</b></span>
                    <span>{sponsorName}</span>
                </div>
                <div className={styles.section}>
                    <span><b>Period:</b></span>
                    {!!invoiceRangeFrom && !!invoiceRangeTo && <span>{formatDate(invoiceRangeFrom)} to {formatDate(invoiceRangeTo)}</span>}
                    {!!invoiceRangeFrom && !invoiceRangeTo && <span>From {formatDate(invoiceRangeFrom)}</span>}
                    {!invoiceRangeFrom && !!invoiceRangeTo && <span>Until {formatDate(invoiceRangeTo)}</span>}
                    {!invoiceRangeFrom && !invoiceRangeTo && <span>Lifetime</span>}
                </div>
            </div>
            {invoice &&
                <table className={styles.feeTable}>
                    <tbody>
                        <tr>
                            <th>Driver Name</th>
                            <th>Driver Email</th>
                            <th>Fees</th>
                        </tr>
                        {invoice.driverFees.map(driver => (
                            <tr key={driver.id}>
                                <td>{driver.name}</td>
                                <td>{driver.email}</td>
                                <td>{formatUsd(driver.feeUsd)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
            <div className={styles.totalRow}>
                <span><b>Total Fee:</b></span>
                <span>{formatUsd(invoice?.totalFeeUsd)}</span>
            </div>
        </div>
    );
}