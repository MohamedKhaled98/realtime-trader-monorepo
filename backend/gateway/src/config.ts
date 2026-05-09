function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.error(`[config] missing required env var: ${name}`);
        process.exit(1);
    }
    return value;
}

export const JWT_SECRET = required("JWT_SECRET");
export const JWT_EXPIRES_IN = "7d";
export const JWT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

export const config = {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_EXPIRES_IN_SECONDS,
    FINNHUB_URL: required("FINNHUB_URL"),
    FINNHUB_TOKEN: required("FINNHUB_TOKEN"),
    REDIS_URL: required("REDIS_URL"),
    PORT: process.env.PORT ?? 8080
} as const;
