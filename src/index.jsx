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

const LoginRoot = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const theme = createTheme({
    palette: {
        primary: { main: '#6c37bd' },
        secondary: { main: '#ffc200' },
    },
});

const Main = () => {
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
    <ThemeProvider theme={theme}>
        <GoogleOAuthProvider clientId={clientId}>
            { identity ? <App identity={identity} /> : <Login /> }
        </GoogleOAuthProvider>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
