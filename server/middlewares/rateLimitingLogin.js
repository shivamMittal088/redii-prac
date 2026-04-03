import redis from "../redis.js";
import dotenv from "dotenv";

dotenv.config();

const rateLimitingLogin = ()=>{
    return async(req,res,next)=>{
        const ip = req.ip;
        const key = `login:${ip}`;
        try{
            const requestCount = parseInt(await redis.get(key)) || 0;

            if(requestCount >= process.env.REDIS_RATE_LIMIT_REQUESTS_LOGIN){
                const ttl = await redis.ttl(key);
                console.log(`IP ${ip} has exceeded the login rate limit.`);
                return res.status(429).json({
                    error: "Too many login attempts. Please try again later.",
                    ttl,
                });
            }
            req.loginRateLimitKey = key;
            next();
        } catch (err) {
            console.error("Error in rate limiting middleware:", err);
            next(err);

        }
    }
}

export default rateLimitingLogin;