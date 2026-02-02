/**
 * API service for communicating with the NZ Tours backend.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Send a chat message to the backend.
 * @param {string} message - The user's message
 * @param {string} flowState - Current conversation flow state
 * @param {object} selections - User's selections from the flow
 * @returns {Promise<object>} Chat response
 */
export async function sendChatMessage(message, flowState = null, selections = {}) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      flow_state: flowState,
      selections,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}

/**
 * Get all available packages.
 * @returns {Promise<Array>} List of packages
 */
export async function getPackages() {
  const response = await fetch(`${API_URL}/api/packages`);

  if (!response.ok) {
    throw new Error('Failed to fetch packages');
  }

  return response.json();
}

/**
 * Get a specific package by ID.
 * @param {string} packageId - The package ID
 * @returns {Promise<object>} Package details
 */
export async function getPackage(packageId) {
  const response = await fetch(`${API_URL}/api/packages/${packageId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch package');
  }

  return response.json();
}

/**
 * Filter packages by criteria.
 * @param {object} filters - Filter criteria
 * @returns {Promise<Array>} Filtered packages
 */
export async function filterPackages(filters) {
  const response = await fetch(`${API_URL}/api/packages/filter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    throw new Error('Failed to filter packages');
  }

  return response.json();
}

/**
 * Force sync packages from Google Sheets.
 * @returns {Promise<object>} Sync status
 */
export async function syncPackages() {
  const response = await fetch(`${API_URL}/api/sync`);

  if (!response.ok) {
    throw new Error('Failed to sync packages');
  }

  return response.json();
}

/**
 * Submit a custom trip planning request.
 * @param {object} data - The trip request data
 * @param {object} data.selections - User's trip preferences
 * @param {string} data.name - User's full name
 * @param {string} data.phone - User's phone number
 * @param {string} data.email - User's email address
 * @param {string} [data.notes] - Additional notes
 * @returns {Promise<object>} Submission response with request_id
 */
export async function submitCustomTrip(data) {
  const response = await fetch(`${API_URL}/api/custom-trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to submit custom trip request');
  }

  return response.json();
}
