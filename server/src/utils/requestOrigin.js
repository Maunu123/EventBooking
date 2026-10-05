// Production accepts only the configured frontend origin. Development also
// accepts the local frontend and API addresses used in Postman.
function isAllowedOrigin(req, expected, production = process.env.NODE_ENV === 'production') {
    const origin = req.headers.origin;
    if (origin === expected) return true;
    if (production) return false;

    const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
    if (!loopback) return false;
    if (origin === undefined) return !req.headers['sec-fetch-site'] && !req.headers.referer;

    const apiPort = String(Number(process.env.PORT) || 5000);
    const localOrigins = ['localhost', '127.0.0.1'].flatMap((host) =>
        ['5173', apiPort].map((port) => `http://${host}:${port}`)
    );
    return localOrigins.includes(origin);
}

module.exports = { isAllowedOrigin };
