import { useState, useEffect } from 'react';
import NewsIndexSearch from './news-index-search';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import styled from 'styled-components';

const LoginRoot = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const [ identity, setIdentity ] = useState('');

    const storeIdentity = ({ credential }) => {
        console.debug('Setting identity', credential);
        window.localStorage.setItem('identity', credential);
        setIdentity(credential);
    };

    useEffect(() => {
        const storedIdentity = window.localStorage.getItem('identity');
        if (storedIdentity) {
            console.debug('Restoring identity', storedIdentity);
            setIdentity(storedIdentity);
        }
    }, []);

    const Login = () => (
        <LoginRoot>
            <GoogleLogin onSuccess={(id) => storeIdentity(id)} />
        </LoginRoot>
    );

    return (
        <GoogleOAuthProvider clientId={clientId}>
            { identity ? <NewsIndexSearch identity={identity} /> : <Login /> }
        </GoogleOAuthProvider>
    )
};
