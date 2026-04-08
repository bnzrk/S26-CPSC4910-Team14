import { useParams } from "react-router-dom";
import { useOrder } from "@/api/order";
import OrderStatusTrack from "@/components/OrderStatusTrack/OrderStatusTrack";

export default function OrderPage()
{
    const { orderId: paramId } = useParams();
    const { data: order, isLoading: isOderLoading, isError: isOrderError } = useOrder(orderId);

    return (
        <div>
            {order && order.id}
        </div>
    );

    // return <OrderStatusTrack status={0}/>
}