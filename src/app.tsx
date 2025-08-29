import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, CircularProgress, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Approvals from './approvals';
import { ConfigContext } from './context';
import Ecommerce from './ecommerce/ecommerce';
import InvoiceClaims from './invoice-claims';
import Onboarding from './onboarding';
import SemanticSearch from './semantic-search';
import { Brand, BrandImage, ContentRoot } from './shared';

const navitems = [
    { label: 'Semantic Search', path: 'semantic-search', component: <SemanticSearch /> },
    { label: 'Invoice Claims', path: 'invoice-claims', component: <InvoiceClaims /> },
    { label: 'Approvals', path: 'approvals', component: <Approvals /> },
    { label: 'Onboarding', path: 'onboarding', component: <Onboarding /> },
    { label: 'e-Commerce', path: 'e-commerce', component: <Ecommerce /> },
];

const NavBar = () => {
    const { clusterUrl } = useContext(ConfigContext);
    const location = useLocation();
    const [ drawerOpen, setDrawerOpen ] = useState(false);

    return (
        <>
            <AppBar>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <BrandImage src="logo-mark.svg" />
                    <Brand>Orkes Labs</Brand>
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }} flex="1" justifyContent="space-between">
                        <Stack direction="row">
                        {navitems.map(({ label, path }) => (
                            <Button
                                key={path}
                                component={Link}
                                to={`/demo/${path}`}
                                color={location.pathname.endsWith(path) ? 'secondary' : 'inherit'}
                                variant={location.pathname.endsWith(path) ? 'contained' : 'text'}
                            >
                                {label}
                            </Button>
                        ))}
                        </Stack>
                        <Button
                            component={Link}
                            to={clusterUrl}
                            target="_blank"
                            variant="contained"
                            color="secondary"
                            sx={{ justifySelf: 'flex-end' }}
                        >
                            Launch Cluster
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                container={document.body}
                open={drawerOpen}
                onClose={() => setDrawerOpen((open) => !open)}
                ModalProps={{ keepMounted: true }}
            >
                <Box onClick={() => setDrawerOpen((open) => !open)} sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ my: 2 }}>
                        Sekro Labs
                    </Typography>
                    <Divider />
                    <List>
                        {navitems.map(({ label, path }) => (
                            <ListItem key={label}>
                                <ListItemButton component={Link} to={`/demo/${path}`}>
                                    <ListItemText primary={label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

const App = ({ identity }) => {
    const { init, profile } = useContext(ConfigContext);

    useEffect(() => init(identity, 'https://ys.orkesconductor.io'), []);

    const Content = () => (
        <Routes>
            { navitems.map(({ path, component }) => (
                <Route key={path} path={`/demo/${path}`} element={component} />
            ))}
            <Route path="*" element={<Navigate to={`/demo/${navitems[0].path}`} />} />
        </Routes>
    );

    return (
        <BrowserRouter>
            <NavBar />
            <ContentRoot>
                { profile.email ? <Content /> : <CircularProgress /> }
            </ContentRoot>
        </BrowserRouter>
    );
};
export default App;
