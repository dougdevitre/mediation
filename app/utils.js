/**
 * Shared utilities for Access to Mediation interactive tools.
 * Import these instead of redefining in each component.
 */

/**
 * Download a text file to the user's device.
 * @param {string} content - File content
 * @param {string} filename - Download filename
 */
export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Load JSON data from localStorage.
 * @param {string} key - Storage key
 * @param {*} fallback - Default value if key not found or parse fails
 * @returns {*} Parsed data or fallback
 */
export function loadFromStorage(key, fallback = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Save JSON data to localStorage.
 * @param {string} key - Storage key
 * @param {*} data - Data to serialize and store
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

/**
 * Format a number as USD currency.
 * @param {number} n - Amount
 * @returns {string} Formatted string like "$1,234"
 */
export function formatCurrency(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/**
 * Get today's date as YYYY-MM-DD string.
 * @returns {string}
 */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
