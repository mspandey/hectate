/**
 * moderation.js — Hectate Content Moderation Utility
 */

const HARMFUL_KEYWORDS = [
  'hate', 'abuse', 'threat', 'kill', 'die', 'stupid', 'idiot', 'ugly', 'disgusting',
  'harass', 'bully', 'racist', 'sexist', 'violent', 'attack', 'hit', 'punch'
];

/**
 * Checks if text contains any harmful keywords.
 * @param {string} text 
 * @returns {boolean} True if harmful content detected
 */
function containsHarmfulContent(text) {
  if (!text) return false;
  const lowercaseText = text.toLowerCase();
  return HARMFUL_KEYWORDS.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowercaseText);
  });
}

module.exports = {
  containsHarmfulContent,
  HARMFUL_KEYWORDS
};
