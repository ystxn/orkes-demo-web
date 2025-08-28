import {
    Box,
    Button,
    Dialog,
    DialogActions, DialogContent, DialogTitle,
    Divider,
    Stack,
    Typography
} from "@mui/material";
import { ConfigContext } from "../context";
import { useContext, useEffect, useState } from "react";
import { buildImageUrl, formatDate } from '../shared';

const OrdersPane = ({ orders, products }) => {
    const [ orderId, setOrderId ] = useState(orders[0]?.id);
    const [ cart, setCart ] = useState(null);
    const { callApi } = useContext(ConfigContext);

    useEffect(() => {
        if (!orderId) {
            return;
        }
        callApi('get', `execution/${orderId}`, null, (execution) => {
            const cartItems = Object.entries(execution.variables.cart)
                .filter(([_, quantity]) => (quantity as number) > 0)
                .map(([itemName, quantity]) => {
                    const product = products.find(p => p.name === itemName);
                    const qty = quantity as number;
                    return { product, quantity: qty, subtotal: (product?.price || 0) * qty };
                });
            setCart(cartItems);
        });
    }, [ orderId ]);

    const totalPrice = cart.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <Stack direction="row" gap={5}>
            <Stack gap={2}>
                {orders.map(order => (
                    <Button
                        key={order.id}
                        variant={order.id === orderId ? "contained" : "outlined"}
                        onClick={() => setOrderId(order.id)}
                    >
                        {formatDate(order.date)}
                    </Button>
                ))}
            </Stack>
            { cart && (
                <Stack>
                    <Typography mb={3}>
                        Order ID: {orderId}
                    </Typography>
                    <Stack spacing={2}>
                        {cart.map(({ product, quantity, subtotal }, index) => (
                            <Box key={product?.name || index}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        component="img"
                                        src={buildImageUrl(product?.imageId)}
                                        alt={product?.name}
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 1,
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6">{product?.name}</Typography>
                                            <Typography variant="h6" color="primary">
                                                ${subtotal.toFixed(2)}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                ${product?.price.toFixed(2)} each
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Quantity: {quantity}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                                {index < cart.length - 1 && <Divider sx={{ mt: 2 }} />}
                            </Box>
                        ))}
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5">Total:</Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                            ${totalPrice.toFixed(2)}
                        </Typography>
                    </Box>
                </Stack>
            )}
        </Stack>
    );
};

const MyOrdersOverlay = ({ open, onClose, products }) => {
    const { callApi } = useContext(ConfigContext);
    const [ orders, setOrders ] = useState([]);

    useEffect(() => {
        callApi('get', `search-executions?workflowName=ecommerce-cart&status=COMPLETED&identityCorrelation=true&size=100`, null, (executions) => {
            setOrders(executions.map(e => ({ date: e.endTime, id: e.workflowId })));
        });
    }, []);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                My Orders
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    { orders.length > 0 ? <OrdersPane products={products} orders={orders} /> : (<Typography>You have no past orders</Typography>) }
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default MyOrdersOverlay;
