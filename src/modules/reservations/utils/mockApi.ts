/**
 * Utility function to simulate API delay and potential errors
 * This makes the mock data behave more like real API calls
 */
export const simulateApiCall = async <T>(
  data: T,
  delay: number = 500,
  errorRate: number = 0
): Promise<T> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate potential API errors
  if (errorRate > 0 && Math.random() < errorRate) {
    throw new Error('Simulated API error');
  }
  
  return data;
};

/**
 * Utility to deep clone data to prevent mutations
 */
export const cloneData = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};
