// Helper utility functions

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number}
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Get week number for a given date
 * @param {Date} date 
 * @returns {number}
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get all dates for a specific week
 * @param {number} year 
 * @param {number} week 
 * @returns {Date[]}
 */
function getWeekDates(year, week) {
  const jan1 = new Date(year, 0, 1);
  const days = (week - 1) * 7 - jan1.getDay() + 1;
  const monday = new Date(year, 0, days + 1);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date);
  }
  return weekDates;
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Validate required fields in request body
 * @param {object} body - Request body
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object} { isValid: boolean, missingFields: string[] }
 */
function validateRequiredFields(body, requiredFields) {
  const missingFields = requiredFields.filter(field => !body[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Round number to specified decimal places
 * @param {number} num 
 * @param {number} decimals 
 * @returns {number}
 */
function roundToDecimals(num, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Get day names array
 * @returns {string[]}
 */
function getDayNames() {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
}

/**
 * Create standardized API response
 * @param {boolean} success 
 * @param {any} data 
 * @param {string} message 
 * @param {any} error 
 * @returns {object}
 */
function createApiResponse(success, data = null, message = null, error = null) {
  const response = { success };
  
  if (data !== null) response.data = data;
  if (message) response.message = message;
  if (error) response.error = error;
  
  return response;
}

module.exports = {
  toRadians,
  calculateDistance,
  getWeekNumber,
  getWeekDates,
  formatDate,
  validateRequiredFields,
  roundToDecimals,
  getDayNames,
  createApiResponse
};
