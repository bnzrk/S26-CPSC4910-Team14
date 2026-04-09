import { useParams } from "react-router-dom";
import { useOrder } from "@/api/order";
import { ORDER_STATUS } from "@/constants/orderStatuses";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import OrderStatusTrack from "@/components/OrderStatusTrack/OrderStatusTrack";
import styles from "./OrderPage.module.scss";

function formatToLocalDate(date)
{
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export default function OrderPage()
{
    const { orderId } = useParams();
    const { data: order, isLoading: isOderLoading, isError: isOrderError } = useOrder(orderId);

    const dates = {
        [ORDER_STATUS.Placed]: order && order.placedDateUtc ? formatToLocalDate(order.placedDateUtc) : null,
        [ORDER_STATUS.Shipped]: order && order.shippedDateUtc ? formatToLocalDate(order.shippedDateUtc) : null,
        [ORDER_STATUS.OutForDelivery]: order && order.deliveryStartDateUtc ? formatToLocalDate(order.deliveryStartDateUtc) : null,
        [ORDER_STATUS.Delivered]: order && order.deliveryCompleteDateUtc ? formatToLocalDate(order.deliveryCompleteDateUtc) : null
    }

    return (
        <CardHost>
            <OrderStatusTrack status={order?.status} dates={dates} />
            <Card className={styles.summary} title={`Order #${String(order?.id).padStart(5, '0')}`}>
                {order && order.status == ORDER_STATUS.Placed && <AsyncButton className={styles.cancel}color='secondary' text='Cancel Order'/>}
            </Card>
        </CardHost>
    );
}