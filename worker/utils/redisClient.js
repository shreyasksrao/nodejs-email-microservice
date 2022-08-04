const Redis = require('ioredis');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../config/emailConfig.env') });

const MAX_SEARCH_RESULTS = 1000;

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
});

const performSearch = async (index, ...query) => {
  try {
    const searchResults = await redis.call('FT.SEARCH', index, query, 'LIMIT', '0', MAX_SEARCH_RESULTS);
    if (searchResults.length === 1) {
      return [];
    }
    const results = [];
    for (let n = 2; n < searchResults.length; n += 2) {
      const result = {};
      const fieldNamesAndValues = searchResults[n];

      for (let m = 0; m < fieldNamesAndValues.length; m += 2) {
        const k = fieldNamesAndValues[m];
        const v = fieldNamesAndValues[m + 1];
        result[k] = v;
      }

      results.push(result);
    }
    return results;
  } catch (e) {
    console.log(`Invalid search request for index: ${index}, query: ${query}`);
    console.error(e);
    return [];
  }
};

module.exports = {
  getClient: () => redis,
  getKeyName: (...args) => `emailer:${args.join(':')}`,
  performSearch,
};