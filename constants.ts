export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL = '7d';

export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60; // 15m
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7d

export const IS_PROD = process.env.NODE_ENV === 'production';
