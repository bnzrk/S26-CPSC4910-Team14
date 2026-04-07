import styles from "./OrderStatusTrack.module.scss";

const ORDER_STATUS = {
    Placed: 0,
    Shipped: 1,
    OutForDelivery: 2,
    Delivered: 3
};

export default function OrderStatusTrack({ status })
{
    return (
        <div className={styles.orderStatus}>
            <div className={styles.track}>
                {
                    Object.values(ORDER_STATUS).map((s) =>
                    {
                        const isActive = s == status;
                        return (
                            <div key={status} className={styles.icon}>
                                <div style={styles.circle}>
                                    {isActive && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                borderRadius: "50%",
                                                border: "1.5px solid #1D9E75",
                                                animation: "pulse 2s ease-out infinite",
                                            }}
                                        />
                                    )}
                                    <div style={{ width: 18, height: 18 }}>{step.icon}</div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}