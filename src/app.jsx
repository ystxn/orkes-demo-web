import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import Approvals from './approvals';
import { ConfigContext } from './context';
import InvoiceClaims from './invoice-claims';
import Onboarding from './onboarding';
import SemanticSearch from './semantic-search';
import { Brand, BrandImage, ContentRoot, NavBarRoot, NavItem } from './shared';
import { CircularProgress } from '@mui/material';

const navitems = [
    { label: 'Semantic Search', path: 'semantic-search', component: <SemanticSearch /> },
    { label: 'Invoice Claims', path: 'invoice-claims', component: <InvoiceClaims /> },
    { label: 'Approvals', path: 'approvals', component: <Approvals /> },
    { label: 'Onboarding', path: 'onboarding', component: <Onboarding /> },
];

const NavBar = () => {
    const theme = useTheme();
    const { clusterUrl } = useContext(ConfigContext);
    return (
        <NavBarRoot color={theme.palette.primary.main}>
            <Stack direction="row" className="links">
                <BrandImage src="logo-mark.svg" />
                <Brand>
                    Orkes Labs
                </Brand>
                { navitems.map(({ label, path }) => (
                    <NavItem key={path}>
                        <Button component={Link} to={`/demo/${path}`}>
                            {label}
                        </Button>
                    </NavItem>
                ))}
            </Stack>
            <NavItem className="cluster">
                <Button
                    component={Link}
                    to={clusterUrl}
                    target="_blank"
                >
                    Launch Cluster
                </Button>
            </NavItem>
        </NavBarRoot>
    );
};

const App = ({ identity }) => {
    const [ loading, setLoading ] = useState(true);
    const { setIdentity, setClusterUrl } = useContext(ConfigContext);
    useEffect(() => {
        setClusterUrl('https://ys.orkesconductor.io');
        setIdentity(identity);
        setLoading(false);
    }, []);

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
                { !loading ? <Content /> : <CircularProgress /> }
            </ContentRoot>
        </BrowserRouter>
    );
};
export default App;
