import { useEffect, useState } from 'react';
import { AuthContext, authRequest } from './context.js';
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        let active = true;
        authRequest('me').then((value) => { if (active) setUser(value); })
            .catch(() => { if (active) setError('Account service is unavailable. Please try again later.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);
    async function authenticate(mode, values) {
        const account = await authRequest(mode, values);
        setUser(account); setError('');
        return account;
    }
    async function logout() { await authRequest('logout', {}); setUser(null); }
    return <AuthContext.Provider value={{ user, loading, error, authenticate, logout }}>{children}</AuthContext.Provider>;
}
