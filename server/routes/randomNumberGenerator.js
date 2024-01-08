/**
 * Generates an array of random unique numbers within a limit.
 * 
 * @param {number} amount - The number of random numbers to generate. 
 * @param {number} limit - The upper limit for the random numbers (inclusive).
 * @returns {number[]} - An array of unique random numbers within the limit.
 */

const generateRandomNumbers = (amount, limit) => {
    const result = [];
    const memo = {};
  
    while (result.length < amount) {
      const num = Math.floor(Math.random() * limit) + 1;
      if (!memo[num]) {
        memo[num] = num;
        result.push(num);
      }
    }
  
    return result;
  };
  
  module.exports = generateRandomNumbers;
  