import { createContext, useState } from 'react';

interface ConfigContextType {
    profile: any | null;
    identity: any | null;
    setIdentity: (identity: any) => void;
    clusterUrl: string | null;
    setClusterUrl: (clusterUrl: string) => void;
    callApi: (
        method: string,
        path: string,
        body?: any,
        onSuccess?: (data: any) => void,
        onError?: (error: any) => void,
        setLoading?: (loading: boolean) => void
    ) => void;
}

export const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

const origin = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';

const ConfigProvider = ({ children }) => {
    const [ profile, setProfile ] = useState({});
    const [ identity, setIdentity ] = useState();
    const [ clusterUrl, setClusterUrl ] = useState<string | null>(null);

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
            body: undefined,
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
                    const error = {
                        status: response.status,
                        statusText: response.statusText,
                        body: await response.json(),
                    };
                    if (error.status === 403) {
                        window.localStorage.clear();
                        window.location.reload();
                        return;
                    }
                    console.error(error);
                    throw new Error(JSON.stringify(error.body));
                }
            })
            .then((response) => {
                if (onSuccess) {
                    onSuccess(response);
                }
            })
            .catch((error) => {
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

    const value : ConfigContextType = {
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
