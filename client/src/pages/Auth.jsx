import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/context.js';
import './Auth.css';

export function AuthPage({ register = false }) {
    const { user, loading, error: serviceError, authenticate } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const queryRole = params.get('role');
    const [role, setRole] = useState(() => (queryRole === 'organizer' ? 'organizer' : 'buyer'));
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [visible, setVisible] = useState(false);

    if (loading) return <main className="auth-page" role="status">Checking your session…</main>;
    if (user) {
        return <Navigate to={user.role === 'organizer' ? '/box-office' : '/'} replace />;
    }

    async function submit(e) {
        e.preventDefault();
        if (busy) return;
        const data = Object.fromEntries(new FormData(e.currentTarget));
        if (register && data.password !== data.confirm) { setError('Passwords do not match.'); return; }
        setError(''); setBusy(true);
        try {
            const loggedUser = await authenticate(register ? 'register' : 'login', {
                name: data.name,
                email: data.email,
                password: data.password,
                role: role
            });
            const effectiveRole = loggedUser?.role || role;
            if (effectiveRole === 'organizer') {
                navigate('/box-office', { replace: true });
            } else {
                navigate('/events', { replace: true });
            }
        }
        catch (err) { setError(err.message || 'Unable to connect. Please try again.'); }
        finally { setBusy(false); }
    }
    return <main className="auth-page"><div className="auth-layout">
        <section className="auth-intro"><span>WELCOME TO EVENTBOOK</span><h1>{register ? 'Great experiences start here.' : 'Your next experience awaits.'}</h1><p>Discover events, explore new interests and make plans worth looking forward to.</p><Link to="/events">Explore upcoming events →</Link></section>
        <section className="auth-card"><h2>{register ? 'Create your account' : 'Welcome back'}</h2><p>{register ? 'Enter your details to get started.' : 'Log in to your EventBook account.'}</p>
            <form onSubmit={submit}>
                <fieldset disabled={busy}>
                <fieldset className="auth-roles">
                    <legend>{register ? 'Create an account as' : 'Log in as'}</legend>
                    <div className="auth-role-options">
                        {[['organizer', 'Event Organizer', 'Plan and host events'], ['buyer', 'Ticket Buyer', 'Discover and book tickets']].map(([value, label, description]) => (
                            <label key={value} className={role === value ? 'auth-role selected' : 'auth-role'}>
                                <input type="radio" name="role" value={value} checked={role === value} onChange={() => { setRole(value); setError(''); }} />
                                <span><strong>{label}</strong><small>{description}</small></span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                {register && <><label htmlFor="auth-name">Full name</label><input id="auth-name" name="name" autoComplete="name" required maxLength={100} pattern=".*\S.*" /></>}
                <label htmlFor="auth-email">Email address</label><input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} />
                <label htmlFor="auth-password">Password</label><div className="auth-password"><input id="auth-password" name="password" type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} aria-describedby="password-hint" /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</button></div>
                <p id="password-hint" className="auth-hint">Use 8–128 characters.</p>
                {register && <><label htmlFor="auth-confirm">Confirm password</label><input id="auth-confirm" name="confirm" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128} /></>}
                {(error || serviceError) && <p className="auth-error" role="alert">{error || serviceError}</p>}
                <button className="auth-submit" type="submit">{busy ? 'Please wait…' : register ? 'Create account' : 'Log in'}</button>
                </fieldset>
            </form>
            <p className="auth-switch">{register ? 'Already have an account?' : 'New to EventBook?'} <Link to={`${register ? '/login' : '/register'}?role=${role}`}>{register ? 'Log in' : 'Create an account'}</Link></p>
        </section>
    </div></main>;
}

export function AccountPage() {
    const { user, loading, error: serviceError, logout } = useAuth();
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    if (loading) return <main className="auth-page" role="status">Checking your session…</main>;
    if (!user) return <Navigate to="/login" replace />;
    async function signOut() {
        setBusy(true); setError('');
        try { await logout(); } catch { setError('Could not log out. Please try again.'); } finally { setBusy(false); }
    }
    return <main className="auth-page"><section className="auth-card account-card"><span className="account-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span><h1>Welcome, {user.name}</h1><p>You’re signed in to EventBook.</p><dl><dt>Name</dt><dd>{user.name}</dd><dt>Email</dt><dd>{user.email}</dd><dt>Account type</dt><dd>{user.role === 'organizer' ? 'Event Organizer' : 'Ticket Buyer'}</dd></dl><Link className="auth-submit" to={user.role === 'organizer' ? '/box-office' : '/events'}>{user.role === 'organizer' ? 'Open Box Office' : 'Discover events'}</Link><button className="auth-logout" onClick={signOut} disabled={busy}>{busy ? 'Logging out…' : 'Log out'}</button>{(error || serviceError) && <p role="alert" className="auth-error">{error || serviceError}</p>}</section></main>;
}
