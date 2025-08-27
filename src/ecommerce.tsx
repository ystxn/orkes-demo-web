import Typography from "@mui/material/Typography";
import { Card, CardMedia, CardContent, CardActions, Box, Button, IconButton, Badge, Fab, CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Zoom } from "@mui/material";
import { Add, Remove, ShoppingCart, CheckCircle } from "@mui/icons-material";
import { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { ConfigContext } from "./context";

const WrapBox = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 1.5rem;
    padding: 0 2rem 2rem 2rem;
`;

const FloatingBadge = styled.div`
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 1000;
`;

const buildImageUrl = (unsplashId) => `https://images.unsplash.com/photo-${unsplashId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;

const CheckoutOverlay = ({ open, onClose, cart, products, onPaymentComplete }) => {
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

        setTimeout(() => {
            setIsProcessingPayment(false);
            setShowPaymentSuccess(true);

            setTimeout(() => {
                setShowPaymentSuccess(false);
                onPaymentComplete();
                onClose();
            }, 2000);
        }, 1500);
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

                <Divider sx={{ my: 2 }} />                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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

const ProductCards = ({ items, cart, setCart }) => {
    const updateQuantity = (itemName, change) => {
        setCart(prev => ({
            ...prev,
            [itemName]: Math.max(0, (prev[itemName] || 0) + change)
        }));
    };

    const addToCart = (item) => {
        if (!cart[item.name]) {
            setCart(prev => ({ ...prev, [item.name]: 1 }));
        } else {
            setCart(prev => ({ ...prev, [item.name]: prev[item.name] + 1 }));
        }
    };

    const cards = items.map(item => (
        <Card key={item.name} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardMedia
                component="img"
                height="200"
                image={buildImageUrl(item.imageId)}
                alt={item.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h5">
                        {item.name}
                    </Typography>
                    <Typography color="text.secondary">
                        ${item.price}
                    </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    {item.description}
                </Typography>
            </CardContent>
            <CardActions sx={{ alignItems: 'end', padding: '0 1.5rem 1rem 1.5rem' }}>
                {cart[item.name] && cart[item.name] > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'center' }}>
                        <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.name, -1)}
                        >
                            <Remove />
                        </IconButton>
                        <Typography variant="body1" sx={{ minWidth: '20px', textAlign: 'center' }}>
                            {cart[item.name]}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.name, 1)}
                        >
                            <Add />
                        </IconButton>
                    </Box>
                ) : (
                    <Button
                        variant="outlined"
                        color="info"
                        onClick={() => addToCart(item)}
                        sx={{ width: '100%' }}
                    >
                        Add to Cart
                    </Button>
                )}
            </CardActions>
        </Card>
    ));
    return <WrapBox>{cards}</WrapBox>;
};

type Product = {
    imageId: string;
    name: string;
    description: string;
    price: number;
};

const ECommerce = () => {
    const { callApi, profile } = useContext(ConfigContext);
    const [ products, setProducts ] = useState<Product[]>([]);
    const [ cart, setCart ] = useState<{[key: string]: number}>({});
    const [ checkoutOpen, setCheckoutOpen ] = useState(false);
    const totalItems = Object.values(cart).reduce((sum: number, quantity: number) => sum + quantity, 0);

    const setResults = ({ output }) => setProducts(output.result);

    useEffect(() => {
        const workflowName = 'ecommerce-list-products';
        callApi('get', `search-executions?workflowName=${workflowName}&status=COMPLETED`, null, (executions) => {
            if (executions.length === 0) {
                callApi('post', `execute/${workflowName}/1`, null, setResults);
            } else {
                callApi('get', `execution/${executions[0].workflowId}`, null, setResults);
            }
        });
    }, []);

    const Main = () => {
        if (products.length === 0 ) {
            return <CircularProgress />;
        }
        return (
            <>
                <ProductCards items={products} cart={cart} setCart={setCart} />
                <FloatingBadge>
                    <Badge badgeContent={totalItems} color="warning">
                        <Fab
                            color="info"
                            aria-label="checkout"
                            disabled={totalItems === 0}
                            onClick={() => setCheckoutOpen(true)}
                        >
                            <ShoppingCart />
                        </Fab>
                    </Badge>
                </FloatingBadge>
                <CheckoutOverlay
                    open={checkoutOpen}
                    onClose={() => setCheckoutOpen(false)}
                    cart={cart}
                    products={products}
                    onPaymentComplete={() => setCart({})}
                />
            </>
        );
    };

    return (
        <>
            <Typography variant="h5" mb={2}>
                eCommerce
            </Typography>
            <Main />
        </>
    )
};
export default ECommerce;
