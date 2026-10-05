import { useEffect, useState, useCallback } from 'react';
import { events as samples } from '../data/events.js';
import { request } from './request.js';
import { EventsContext } from './events-context.js';

function uniqueEvents(items) {
    const byId = new Map();
    for (const event of items || []) {
        if (event?.id == null) continue;
        byId.set(String(event.id), event);
    }
    return [...byId.values()];
}

export default function EventsProvider({ children }) {
    const [events, setEvents] = useState(() => uniqueEvents(samples));
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState('');
    const refresh = useCallback(async () => {
        try { const result = await request('events'); setEvents(uniqueEvents(result.events)); setNotice(result.notice || ''); }
        catch (error) { setNotice(error.message); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => {
        let active = true;
        request('events').then((result) => { if (active) { setEvents(uniqueEvents(result.events)); setNotice(result.notice || ''); } })
            .catch((error) => { if (active) setNotice(error.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);
    return <EventsContext.Provider value={{ events, loading, notice, refresh }}>{children}</EventsContext.Provider>;
}
