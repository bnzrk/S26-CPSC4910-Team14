import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/Toast/ToastContext";
import { useParams } from "react-router-dom";
import { useOrder, useCancelOrder } from "@/api/order";
import { ORDER_STATUS } from "@/constants/orderStatuses";
import { useOrgContext } from "@/contexts/OrgContext/OrgContext";
import OrderItem from "./components/OrderItem";
import CardHost from "@/components/CardHost/CardHost";
import Modal from "@/components/Modal/Modal";
import Card from "@/components/Card/Card";
import InlineInfo from "@/components/InlineInfo/InlineInfo";
import AsyncButton from "@/components/AsyncButton/AsyncButton";
import OrderStatusTrack from "@/components/OrderStatusTrack/OrderStatusTrack";
import PointBadge from "@/components/PointBadge/PointBadge";
import Button from "@/components/Button/Button";
import styles from "./OrderPage.module.scss";
import clsx from "clsx";

const MODALS = {
    cancel: "cancel"
}

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
    const navigate = useNavigate();
    const { push } = useToast();

    const { selectedOrgId } = useOrgContext();

    const { orderId } = useParams();
    const { data: order, isLoading: isOrderLoading, isError: isOrderError } = useOrder(orderId);
    const cancelOrder = useCancelOrder();

    // Navigate to order list if selected org does not match order
    useEffect(() =>
    {  
        if (order && selectedOrgId && order.sponsorOrgId !== selectedOrgId)
        {
            navigate("/orders");
        }
    }, [order, selectedOrgId]);

    const [currentModal, setCurrentModal] = useState(null);

    const groupedItems = order ? Object.values(
        order?.items.reduce((acc, item) =>
        {
            if (!acc[item.title]) acc[item.title] = { ...item, count: 0 };
            acc[item.title].count++;
            return acc;
        }, {})
    ) : [];

    const total = order ? order.items.reduce((sum, item) => sum + item.pricePoints, 0) : 0;

    const dates = {
        [ORDER_STATUS.Placed]: order && order.placedDateUtc ? formatToLocalDate(order.placedDateUtc) : null,
        [ORDER_STATUS.Shipped]: order && order.shippedDateUtc ? formatToLocalDate(order.shippedDateUtc) : null,
        [ORDER_STATUS.OutForDelivery]: order && order.deliveryStartDateUtc ? formatToLocalDate(order.deliveryStartDateUtc) : null,
        [ORDER_STATUS.Delivered]: order && order.deliveryCompleteDateUtc ? formatToLocalDate(order.deliveryCompleteDateUtc) : null
    }

    async function handleCancelOrder()
    {
        try
        {
            await cancelOrder.mutateAsync({ orderId });
            setCurrentModal(null);
            push({ message: 'Order cancelled.', type: 'success' });
        }
        catch (ex)
        {
            push({ message: 'Failed to cancel order.', type: 'error' });
        }
    }

    return (
        <>
            <Modal isOpen={currentModal == MODALS.cancel} onClose={() => setCurrentModal(null)}>
                <Modal.Header title='Cancel Order' />
                <Modal.Body>
                    <p>Are you sure you want to cancel this order?</p>
                    <InlineInfo messages={["Orders cannot be cancelled once they have shipped."]} />
                </Modal.Body>
                <Modal.Buttons position='right'>
                    <Button color='secondary' text='Keep Order' onClick={() => setCurrentModal(null)} />
                    <AsyncButton color='warn' text='Cancel Order' action={handleCancelOrder} />
                </Modal.Buttons>
            </Modal>
            <CardHost>
                <OrderStatusTrack status={order?.status} dates={dates} />
                <Card className={styles.summary} title={`Order #${String(order?.id).padStart(5, '0')}`} headerRight={formatToLocalDate(order?.placedDateUtc)}>
                    <div className={styles.items}>
                        {groupedItems && groupedItems.map((item) => <OrderItem key={item.id} item={item} quantity={item.count} />)}
                    </div>
                    <div className={styles.total}>
                        <div className={styles.value}>
                            Total: <PointBadge className={clsx(styles.points, order?.status == ORDER_STATUS.Cancelled && styles.canceled)} points={total} />
                        </div>
                    </div>
                    <div className={styles.buttons}>
                        {order && order.status == ORDER_STATUS.Placed && <Button className={styles.cancel} color='secondary' text='Cancel Order' onClick={() => setCurrentModal(MODALS.cancel)} />}
                    </div>
                    {order?.status == ORDER_STATUS.Cancelled &&
                        <InlineInfo type='note' messages={["This order has been cancelled."]} />
                    }
                </Card>
            </CardHost>
        </>
    );
}