const rateLimiterMessage = require('../models/rateLimiterMessage');
const rateLimit = require('express-rate-limit');

const rateLimitConfig = {
  windowMs: 3 * 60 * 1000, // 6 minutes
  max: 4, // Limit each IP to 4 requests per `window` (here, per 6 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: rateLimiterMessage },
};

const userLoginAttemptLimiter = rateLimit(rateLimitConfig);

module.exports = userLoginAttemptLimiter;
