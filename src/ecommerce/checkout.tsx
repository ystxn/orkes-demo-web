import { CheckCircle } from "@mui/icons-material";
import {
    Box, Button,
    CircularProgress, Dialog,
    DialogActions, DialogContent, DialogTitle, Divider,
    Stack, Zoom
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { useContext, useState } from "react";
import { ConfigContext } from "../context";
import { buildImageUrl } from "../shared";

const CheckoutOverlay = ({ open, onClose, cart, products, onPaymentComplete, executionId }) => {
    const { callApi } = useContext(ConfigContext);
    const [ isProcessingPayment, setIsProcessingPayment ] = useState(false);
    const [ showPaymentSuccess, setShowPaymentSuccess ] = useState(false);

    const cartItems = Object.entries(cart)
        .filter(([_, quantity]) => (quantity as number) > 0)
        .map(([itemName, quantity]) => {
            const product = products.find(p => p.name === itemName);
            const qty = quantity as number;
            return { product, quantity: qty, subtotal: (product?.price || 0) * qty };
        });

    const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    const handlePayment = async () => {
        setIsProcessingPayment(true);

        const data = { action: "CHECKOUT", cart };
        callApi('post', `signal/${executionId}`, data, () => {
            setIsProcessingPayment(false);
            setShowPaymentSuccess(true);

            setTimeout(() => {
                setShowPaymentSuccess(false);
                onPaymentComplete();
                onClose();
            }, 2000);
        });
    };

    const handleClose = () => {
        if (!isProcessingPayment && !showPaymentSuccess) {
            onClose();
        }
    };

    if (showPaymentSuccess) {
        return (
            <Dialog open={open} maxWidth="sm" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 6 }}>
                    <Zoom in={showPaymentSuccess}>
                        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    </Zoom>
                    <Typography variant="h4" color="success.main" gutterBottom>
                        Payment Complete!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Thank you for your purchase
                    </Typography>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Checkout
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    {cartItems.map(({ product, quantity, subtotal }, index) => (
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
                            {index < cartItems.length - 1 && <Divider sx={{ mt: 2 }} />}
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
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} disabled={isProcessingPayment}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handlePayment}
                    disabled={isProcessingPayment || cartItems.length === 0}
                    sx={{ minWidth: 140 }}
                >
                    {isProcessingPayment ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        "Make Payment"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default CheckoutOverlay;
