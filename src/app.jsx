import { Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { createContext } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Approvals from './approvals';
import SemanticSearch from './semantic-search';

const NavBarRoot = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #6c37bd;
    padding: .5rem;
`;

const Brand = styled(Typography)`
    text-transform: uppercase;
    color: white;
    padding-right: 1.5rem;
    align-self: center;
`;

const NavButton = styled(Button)`
    color: white !important;
    display: block;
`;

const ContentRoot = styled.div`
    padding: .5rem;
    height: 100%;
    display: flex;
    flex: 1 1 1px;
`;

const NavBar = () => {
    return (
        <NavBarRoot>
            <Stack direction="row">
                <Brand>
                    Orkes Labs
                </Brand>
                <NavButton component={Link} to="/demo/semantic-search">
                    Semantic Search
                </NavButton>
                <NavButton component={Link} to="/demo/approvals">
                    Approvals
                </NavButton>
            </Stack>
            <NavButton
                component={Link}
                to="https://ys.orkesconductor.io"
                target="_blank"
                sx={{ justifySelf: 'flex-end' }}
            >
                Launch Cluster
            </NavButton>
        </NavBarRoot>
    );
};

export const ConfigContext = createContext({ identity: null, origin: null });

const App = ({ identity }) => {
    const origin = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';
    const config = { identity, origin };

    return (
        <BrowserRouter>
            <ConfigContext.Provider value={config}>
                <NavBar />
                <ContentRoot>
                    <Routes>
                        <Route path="/demo" element={<Navigate to="semantic-search" />} />
                        <Route path="/demo/semantic-search" element={<SemanticSearch />} />
                        <Route path="/demo/approvals" element={<Approvals />} />
                    </Routes>
                </ContentRoot>
            </ConfigContext.Provider>
        </BrowserRouter>
    );
};
export default App;
