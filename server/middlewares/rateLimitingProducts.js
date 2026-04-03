import redis from '../redis.js';
import dotenv from 'dotenv';

dotenv.config();

const rateLimitingProducts = ()=>{
    return async (req,res,next)=>{
        const ip = req.ip;
        const key = `products:${ip}`;
        const currentTime = Math.floor(Date.now() / 1000)
        // const windowSize = process.env.REDIS_RATE_LIMIT || 60; // Default to 60 requests per minute

        // if(!redis.exists(ip)){
        //     await redis.setex(ip,process.env.REDIS_RATE_LIMIT_WINDOW,0);
        // }

        try{
            const requestCount = await redis.incr(key);

            // If first request → set expiry
            if (requestCount === 1) {
                await redis.expire(key, process.env.REDIS_RATE_LIMIT_WINDOW);
            }

            console.log(`IP: ${ip}, Request Count: ${requestCount}`);


            if(requestCount > process.env.REDIS_RATE_LIMIT_REQUESTS_PRODUCTS){
                console.log(`IP ${ip} has exceeded the rate limit.`);
                return res.status(429).json({error: "Too many requests. Please try again later."});
            }

            next();
        }
        catch(err){
                console.error("Error in rate limiting middleware:", err);
                next(err);
        }
    }
}

export default rateLimitingProducts;