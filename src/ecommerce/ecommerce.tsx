import { ShoppingCart } from "@mui/icons-material";
import {
    Badge,
    Button,
    CircularProgress,
    Fab,
    Link, Stack
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ConfigContext } from "../context";
import CheckoutOverlay from "./checkout";
import ProductCards from "./product-cards";
import MyOrdersOverlay from "./my-orders";

const FloatingBadge = styled.div`
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 1000;
`;

const usePrevious = <T,>(value: T): T | undefined => {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};

type Product = {
    imageId: string;
    name: string;
    description: string;
    price: number;
};

const ECommerce = () => {
    const { callApi, profile, clusterUrl } = useContext(ConfigContext);
    const [ products, setProducts ] = useState<Product[]>([]);
    const [ cart, setCart ] = useState<{[key: string]: number}>({});
    const prevCart = usePrevious(cart);
    const [ executionId, setExecutionId ] = useState<string | null>(null);
    const [ checkoutOpen, setCheckoutOpen ] = useState(false);
    const [ myOrdersOpen, setMyOrdersOpen ] = useState(false);
    const [ init, setInit ] = useState(false);
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
        callApi('get', `search-executions?workflowName=ecommerce-cart&status=RUNNING&identityCorrelation=true`, null, (executions) => {
            if (executions.length > 0) {
                setExecutionId(executions[0].workflowId);
                callApi('get', `execution/${executions[0].workflowId}`, null, ({ variables }) => {
                    setCart(variables.cart);
                    setTimeout(() => setInit(true), 500);
                });
            } else {
                setInit(true);
            }
        });
    }, []);

    useEffect(() => {
        if (!init || Object.keys(cart).length === 0 || !prevCart) {
            return;
        }
        const changed: Record<string, { prev: number; next: number }> = {};
        for (const key of new Set([...Object.keys(prevCart), ...Object.keys(cart)])) {
            if (prevCart[key] !== cart[key]) {
                changed[key] = { prev: prevCart[key], next: cart[key] };
            }
        }
        const item = Object.keys(changed).at(0);
        const quantity = (changed[item]?.next || 0) - (changed[item]?.prev || 0);
        const data = { action: "MODIFY_CART", cart, item, quantity };

        if (quantity === 0) {
            return;
        }
        if (!executionId) {
            const correlationData = { correlationId: profile.email };
            callApi('post', 'execute/ecommerce-cart/1', correlationData, (execution) => {
                setExecutionId(execution.workflowId);
                callApi('post', `signal/${execution.workflowId}?async=true`, data);
            });
        } else {
            callApi('post', `signal/${executionId}?async=true`, data);
        }
    }, [ cart ]);

    const reset = () => {
        setCart({});
        setExecutionId(null);
    };

    const Main = () => {
        if (products.length === 0 ) {
            return <CircularProgress />;
        }
        return (
            <>
                <ProductCards
                    items={products}
                    cart={cart}
                    setCart={setCart}
                />
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
                    onPaymentComplete={reset}
                    executionId={executionId}
                />
                <MyOrdersOverlay
                    open={myOrdersOpen}
                    onClose={() => setMyOrdersOpen(false)}
                    products={products}
                />
            </>
        );
    };

    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" mb={2}>
                    eCommerce
                </Typography>
                <Stack direction="row" gap={2}>
                    <Button
                        variant="outlined"
                        onClick={() => setMyOrdersOpen(true)}
                    >
                        My Orders
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        component={Link}
                        href={`${clusterUrl}/execution/${executionId}`}
                        target="_blank"
                        disabled={!executionId}
                        >
                        View Execution
                    </Button>
                </Stack>
            </Stack>
            <Main />
        </>
    )
};
export default ECommerce;
