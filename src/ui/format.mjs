export const formatPrice = v => v.priceUsd === null ? (v.availability === 'upcoming' ? 'Price not announced' : 'Not provided') : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v.priceUsd);
export const formatKm = value => value === null ? 'Not provided' : `${new Intl.NumberFormat('en-US').format(value)} km`;
