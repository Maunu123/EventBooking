/**
 * Utility functions for input validation and sanitization
 */

const clean = (value, max = 1000) => (typeof value === 'string' && value.trim().length <= max ? value.trim() : '');

const emailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const phoneValid = (value) => /^\+?[0-9 ()-]{10,20}$/.test(value);

const isAadhaarValid = (aadhaar) => /^\d{12}$/.test(String(aadhaar).replace(/\s/g, ''));

const isPanValid = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(String(pan).trim().toUpperCase());

const eventImage = (value) => {
    const raw = clean(value, 2000);
    if (!raw) return '';
    try {
        const url = new URL(raw);
        if (url.protocol !== 'https:') return '';
        if (url.hostname === 'www.bing.com' && url.pathname.startsWith('/images/search')) {
            const direct = url.searchParams.get('mediaurl');
            if (!direct) return '';
            const directUrl = new URL(direct);
            return directUrl.protocol === 'https:' ? directUrl.href : '';
        }
        if (url.hostname.includes('google.') && url.pathname.includes('/search')) return '';
        return url.href;
    } catch {
        return '';
    }
};

module.exports = {
    clean,
    emailValid,
    phoneValid,
    isAadhaarValid,
    isPanValid,
    eventImage,
};
