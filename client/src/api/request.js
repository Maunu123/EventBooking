export async function request(path, data) {
    let response;
    try {
        response = await fetch(`/api/${path}`, {
            credentials: 'same-origin',
            ...(data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}),
        });
    } catch { throw new Error('Could not reach the server. Please check your connection and try again.'); }
    let result;
    try { result = await response.json(); } catch { throw new Error('The service is unavailable. Please try again shortly.'); }
    if (!response.ok) throw new Error(result.error || 'Please try again shortly.');
    return result;
}
