/**
 * Utility functions for ticket pricing tiers and promo code discount calculations
 */

const calculateTierUnitPrice = (basePricePaise, ticketType) => {
    if (ticketType === 'VIP Pass') {
        return Math.round(basePricePaise * 1.5);
    }
    if (ticketType === 'Early Bird') {
        return Math.round(basePricePaise * 0.85);
    }
    return basePricePaise;
};

const applyPromoDiscount = (subtotalPaise, promoCode) => {
    const code = String(promoCode || '').trim().toUpperCase();
    if (code === 'FESTIVE20') {
        return Math.round(subtotalPaise * 0.8);
    }
    if (code === 'WELCOME100') {
        return Math.max(0, subtotalPaise - 10000); // Flat ₹100 in paise
    }
    if (code === 'EVENTVIBES') {
        return Math.max(0, subtotalPaise - 20000); // Flat ₹200 in paise
    }
    return subtotalPaise;
};

module.exports = {
    calculateTierUnitPrice,
    applyPromoDiscount,
};
