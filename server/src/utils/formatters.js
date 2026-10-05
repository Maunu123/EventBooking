/**
 * Utility functions for currency and date formatting
 */

const formatCurrencyINR = (amountInRupees) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amountInRupees);
};

const formatIndianDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
};

const formatIndianTime = (dateObj) => {
    return dateObj.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
    }) + ' IST';
};

module.exports = {
    formatCurrencyINR,
    formatIndianDate,
    formatIndianTime,
};
