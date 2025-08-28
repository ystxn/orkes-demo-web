import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';
import App from './app';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material';
import ConfigProvider from './context';

const LoginRoot = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const theme = createTheme({
    palette: {
        primary: { main: '#6c37bd' },
        secondary: { main: '#b08aea' },
    },
});

const Main = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const [ identity, setIdentity ] = useState('');

    const storeIdentity = (r) => {
        if (r.credential) {
            window.localStorage.setItem('identity', r.credential);
            setIdentity(r.credential);
        }
    };

    useEffect(() => {
        const storedIdentity = window.localStorage.getItem('identity');
        if (storedIdentity) {
            setIdentity(storedIdentity);
        }
    }, []);

    const Login = () => (
        <LoginRoot>
            <GoogleLogin onSuccess={(id) => storeIdentity(id)} />
        </LoginRoot>
    );

    return (
        <ThemeProvider theme={theme}>
            <GoogleOAuthProvider clientId={clientId}>
                <ConfigProvider>
                    { identity ? <App identity={identity} /> : <Login /> }
                </ConfigProvider>
            </GoogleOAuthProvider>
        </ThemeProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
