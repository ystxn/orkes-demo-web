import { Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { createContext } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Approvals from './approvals';
import SemanticSearch from './semantic-search';
import { useTheme } from '@mui/material/styles';

const NavBarRoot = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${props => props.color};
    padding: .5rem;
`;

const Brand = styled(Typography)`
    text-transform: uppercase;
    color: white;
    padding-right: 1.5rem;
    align-self: center;
    white-space: nowrap;
    @media screen and (max-width: 600px) {
        display: none
    }
`;

const NavItem = styled.div`
    color: white;
    display: flex;
    align-items: center;
    a {
        color: white !important;
        line-height: 1rem;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    &:not(:last-child)::after {
        margin: .3rem;
        content: '·';
        font-size: 2rem;
        line-height: .1rem;
    }
    &.cluster {
        @media screen and (max-width: 600px) {
            display: none
        }
    }
`;

const ContentRoot = styled.div`
    padding: .5rem;
    height: 100%;
    display: flex;
    flex: 1 1 1px;
`;

const BrandImage = styled.img`
    height: 2rem;
    padding-right: .3rem;
    align-self: center;
`;

const NavBar = () => {
    const theme = useTheme();
    return (
        <NavBarRoot color={theme.palette.primary.main}>
            <Stack direction="row">
                <BrandImage src="logo-mark.svg" />
                <Brand>
                    Orkes Labs
                </Brand>
                <NavItem>
                    <Button component={Link} to="/demo/semantic-search">
                        Semantic Search
                    </Button>
                </NavItem>
                <NavItem>
                    <Button component={Link} to="/demo/approvals">
                        Approvals
                    </Button>
                </NavItem>
            </Stack>
            <NavItem className="cluster">
                <Button
                    component={Link}
                    to="https://ys.orkesconductor.io"
                    target="_blank"
                >
                    Launch Cluster
                </Button>
            </NavItem>
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
