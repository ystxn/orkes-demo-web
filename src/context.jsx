import { createContext, useState } from "react";

export const ConfigContext = createContext({
    profile: null,
    identity: null,
    setIdentity: (identity) => {},
    clusterUrl: null,
    setClusterUrl: (clusterUrl) => {},
    callApi: (method, path, body, onSuccess, onError, setLoading) => {},
});

const origin = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';

const ConfigProvider = ({ children }) => {
    const [ profile, setProfile ] = useState({});
    const [ identity, setIdentity ] = useState();
    const [ clusterUrl, setClusterUrl ] = useState();

    const doSetIdentity = (identity) => {
        setIdentity(identity);
        const base64Url = identity.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const { family_name : lastName, given_name : firstName, email } = JSON.parse(jsonPayload);
        setProfile({ email, firstName, lastName });
    };

    const callApi = (method, path, body, onSuccess, onError, setLoading) => {
        if (setLoading) {
            setLoading(true);
        }
        const config = {
            method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${identity}`,
            },
        };
        if (!(body instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        if (method.toLowerCase() === 'post') {
            config.body = !body ? '{}' : (body instanceof FormData) ? body : JSON.stringify(body);
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
                if (onSuccess) {
                    onSuccess(response);
                }
            })
            .catch((error) => {
                console.error(error);
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

    const value = {
        profile,
        identity,
        setIdentity: doSetIdentity,
        clusterUrl,
        setClusterUrl,
        callApi,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
export default ConfigProvider;
