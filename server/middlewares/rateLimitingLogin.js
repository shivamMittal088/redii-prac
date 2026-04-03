import redis from "../redis.js";
import dotenv from "dotenv";

dotenv.config();

const rateLimitingLogin = ()=>{
    return async(req,res,next)=>{
        const ip = req.ip;
        try{
            const requestCount = await redis.incr(ip);

            // If first request → set expiry
            if (requestCount === 1) {
                await redis.expire(ip, process.env.REDIS_RATE_LIMIT_WINDOW);
            }

            if(requestCount > process.env.REDIS_RATE_LIMIT_REQUESTS_LOGIN){
                console.log(`IP ${ip} has exceeded the rate limit.`);
                return res.status(429).json({
                    error: "Too many login attempts. Please try again later."
                });
            }
            next();
        } catch (err) {
            console.error("Error in rate limiting middleware:", err);
            next(err);

        }
    }
}

export default rateLimitingLogin;