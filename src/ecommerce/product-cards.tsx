import { Add, Remove } from "@mui/icons-material";
import {
    Box, Button, Card, CardActions, CardContent, CardMedia,
    IconButton,
    Stack
} from "@mui/material";
import Typography from "@mui/material/Typography";
import styled from "styled-components";
import { buildImageUrl } from "../shared";

const WrapBox = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 1.5rem;
    padding: 0 2rem 2rem 2rem;
`;

const ProductCards = ({ items, cart, setCart }) => {
    const updateQuantity = (itemName, change) => {
        if (cart[itemName] && (cart[itemName] + change) === 0) {
            setCart(prev => {
                const { [itemName]: _, ...rest } = prev;
                return rest;
            });
            return;
        }
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
export default ProductCards;