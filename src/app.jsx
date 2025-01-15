import { Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { createContext } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Approvals from './approvals';
import Onboarding from './onboarding';
import SemanticSearch from './semantic-search';

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

const navitems = [
    { label: 'Semantic Search', path: 'semantic-search', component: <SemanticSearch /> },
    { label: 'Approvals', path: 'approvals', component: <Approvals /> },
    { label: 'Onboarding', path: 'onboarding', component: <Onboarding /> },
];

const NavBar = () => {
    const theme = useTheme();
    return (
        <NavBarRoot color={theme.palette.primary.main}>
            <Stack direction="row">
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
                    to="https://ys.orkesconductor.io"
                    target="_blank"
                >
                    Launch Cluster
                </Button>
            </NavItem>
        </NavBarRoot>
    );
};

export const ConfigContext = createContext({
    profile: {},
    callApi: (method, path, body, onSuccess, onError, setLoading) => {},
});

const App = ({ identity }) => {
    const origin = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';
    const callApi = (method, path, body, onSuccess, onError, setLoading) => {
        if (setLoading) {
            setLoading(true);
        }
        const config = {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${identity}`,
            },
        };
        if (method.toLowerCase() === 'post') {
            config.body = body ? JSON.stringify(body) : '{}';
        }
        fetch(`${origin}/demo/api/${path}`, config)
            .then(async (response) => {
                if (response.ok) {
                    const data = await response.text();
                    try {
                        return JSON.parse(data);
                    } catch (parseError) {
                        return data;
                    }
                } else {
                    throw new Error(JSON.stringify(response));
                }
            })
            .then((response) => {
                console.debug('response', response)
                if (onSuccess) {
                    onSuccess(response);
                }
            })
            .catch((error) => {
                console.log(error);
                if (onError) {
                    onError(error);
                }
            })
            .finally(() => {
                if (setLoading) {
                    setLoading(false);
                }
            });
    };

    const base64Url = identity.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const { family_name : lastName, given_name : firstName, email } = JSON.parse(jsonPayload);
    const profile = { email, firstName, lastName };
    const config = { profile, callApi };

    return (
        <BrowserRouter>
            <ConfigContext.Provider value={config}>
                <NavBar />
                <ContentRoot>
                    <Routes>
                        { navitems.map(({ path, component }) => (
                            <Route key={path} path={`/demo/${path}`} element={component} />
                        ))}
                        <Route path="*" element={<Navigate to={`/demo/${navitems[0].path}`} />} />
                    </Routes>
                </ContentRoot>
            </ConfigContext.Provider>
        </BrowserRouter>
    );
};
export default App;
