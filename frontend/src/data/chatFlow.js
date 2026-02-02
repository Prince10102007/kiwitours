/**
 * Chat flow configuration for the NZ Tours chatbot.
 * This defines the conversation structure and quick reply options.
 */

export const FLOW_STATES = {
  GREETING: 'greeting',
  DESTINATION: 'destination',
  TRIP_TYPE: 'trip_type',
  DURATION: 'duration',
  BUDGET: 'budget',
  GROUP_SIZE: 'group_size',
  SHOW_PACKAGES: 'show_packages',
  AI_CHAT: 'ai_chat',
};

export const INITIAL_STATE = FLOW_STATES.GREETING;

/**
 * Map of selection values to human-readable labels.
 */
export const SELECTION_LABELS = {
  // Destinations
  north: 'North Island',
  south: 'South Island',
  both: 'Both Islands',
  recommend: 'Recommended',

  // Trip types
  adventure: 'Adventure & Outdoors',
  culture: 'Culture & Heritage',
  nature: 'Nature & Wildlife',
  food: 'Food & Wine',
  mixed: 'Mixed Experience',

  // Duration
  short: '3-5 Days',
  week: '1 Week',
  two_weeks: '2 Weeks',
  flexible: 'Flexible',

  // Budget
  budget: 'Budget ($500-$1,500)',
  mid: 'Mid-Range ($1,500-$3,000)',
  premium: 'Premium ($3,000-$5,000)',
  luxury: 'Luxury ($5,000+)',

  // Group size
  solo: 'Solo Traveler',
  couple: 'Couple',
  small: 'Small Group (3-5)',
  large: 'Large Group (6+)',
};

/**
 * Get a summary of user selections for display.
 */
export function getSelectionsSummary(selections) {
  const summary = [];

  if (selections.destination) {
    summary.push(`Region: ${SELECTION_LABELS[selections.destination] || selections.destination}`);
  }
  if (selections.trip_type) {
    summary.push(`Type: ${SELECTION_LABELS[selections.trip_type] || selections.trip_type}`);
  }
  if (selections.duration) {
    summary.push(`Duration: ${SELECTION_LABELS[selections.duration] || selections.duration}`);
  }
  if (selections.budget) {
    summary.push(`Budget: ${SELECTION_LABELS[selections.budget] || selections.budget}`);
  }
  if (selections.group_size) {
    summary.push(`Group: ${SELECTION_LABELS[selections.group_size] || selections.group_size}`);
  }

  return summary;
}

/**
 * NZ-specific greetings and phrases.
 */
export const NZ_PHRASES = {
  greeting: 'Kia Ora',
  welcome: 'Haere Mai',
  thank_you: 'Ka pai',
  goodbye: 'Ka kite ano',
};

/**
 * Season information for New Zealand.
 */
export const NZ_SEASONS = {
  summer: {
    months: ['December', 'January', 'February'],
    description: 'Peak tourist season with warm weather, perfect for beaches and outdoor activities.',
  },
  autumn: {
    months: ['March', 'April', 'May'],
    description: 'Beautiful fall colors, harvest season, fewer crowds.',
  },
  winter: {
    months: ['June', 'July', 'August'],
    description: 'Ski season in the mountains, quieter attractions.',
  },
  spring: {
    months: ['September', 'October', 'November'],
    description: 'Lambing season, gardens blooming, mild weather.',
  },
};

/**
 * Get the current season in New Zealand based on date.
 */
export function getCurrentNZSeason() {
  const month = new Date().getMonth();

  if (month >= 11 || month <= 1) return 'summer';
  if (month >= 2 && month <= 4) return 'autumn';
  if (month >= 5 && month <= 7) return 'winter';
  return 'spring';
}
