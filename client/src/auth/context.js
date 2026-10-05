import { createContext, useContext } from 'react';
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export async function authRequest(path, data) {
    const response = await fetch(`/api/auth/${path}`, {
        credentials: 'same-origin',
        ...(data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}),
    });
    let result;
    try { result = await response.json(); } catch { throw new Error('Account service is unavailable. Please try again later.'); }
    if (!response.ok) throw new Error(result.error || 'Please try again.');
    return result.user;
}
