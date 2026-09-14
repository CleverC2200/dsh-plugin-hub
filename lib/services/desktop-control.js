/** Bridge to the desktop owner. The browser never receives its private credential. */
export function hasDesktopOwner() { return Boolean(process.env.GEA_DESKTOP_CONTROL_URL && process.env.GEA_DESKTOP_CONTROL_TOKEN); }
export async function desktopControl(action, body) {
    if (!hasDesktopOwner())
        throw Error('DESKTOP_REQUIRED');
    const url = new URL(process.env.GEA_DESKTOP_CONTROL_URL);
    if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port)
        throw Error('INVALID_DESKTOP_OWNER');
    const response = await fetch(new URL('/updates/' + action, url), {
        method: body === undefined ? 'GET' : 'POST',
        headers: { Authorization: 'Bearer ' + process.env.GEA_DESKTOP_CONTROL_TOKEN, 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(65000),
    });
    const value = await response.json();
    if (!response.ok) {
        const code = value?.error;
        throw Error(typeof code === 'string' && /^[A-Z][A-Z_0-9]+$/.test(code) ? code : 'DESKTOP_ACTION_FAILED');
    }
    return value;
}
