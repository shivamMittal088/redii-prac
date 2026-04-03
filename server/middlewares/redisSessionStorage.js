import session from "express-session";
import connectRedis from "connect-redis";
import redis from "../redis.js";
import dotenv from "dotenv";

dotenv.config();

const RedisStore = connectRedis(session);

function parseExpiry(val) {
    const units = { s: 1, m: 60, h: 3600, d: 86400 };
    const match = String(val).match(/^(\d+)([smhd])$/);
    if (!match) return 24 * 3600;
    return parseInt(match[1]) * units[match[2]];
}

const ttlSeconds = parseExpiry(process.env.SESSION_EXPIRES_IN || "1d");

const sessionMiddleware = session({
    store: new RedisStore({ client: redis, prefix: "session:", ttl: ttlSeconds }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        maxAge: ttlSeconds * 1000,
    },
});

export default sessionMiddleware;
