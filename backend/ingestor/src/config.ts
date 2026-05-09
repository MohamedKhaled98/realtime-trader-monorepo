function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.error(`[config] missing required env var: ${name}`);
        process.exit(1);
    }
    return value;
}

export const config = {
    REDIS_URL: required("REDIS_URL"),
    FINNHUB_WS_URL: required("FINNHUB_WS_URL"),
    FINNHUB_TOKEN: required("FINNHUB_TOKEN"),
} as const;
