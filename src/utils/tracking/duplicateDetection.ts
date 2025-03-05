
// Track already processed URLs to prevent duplicate page views
const processedUrls = new Map<string, number>();
const DUPLICATE_WINDOW = 60000; // 60 seconds

export const isDuplicateRequest = (url: string): boolean => {
  const now = Date.now();
  const lastProcessed = processedUrls.get(url);
  
  if (lastProcessed && (now - lastProcessed) < DUPLICATE_WINDOW) {
    console.log('Duplicate request detected for URL:', url);
    return true;
  }
  
  // Update last processed time
  processedUrls.set(url, now);
  
  // Clean up old entries to prevent memory leaks
  if (processedUrls.size > 100) {
    const oldEntries = [...processedUrls.entries()]
      .filter(([_, timestamp]) => (now - timestamp) > DUPLICATE_WINDOW * 2);
    oldEntries.forEach(([key]) => processedUrls.delete(key));
  }
  
  return false;
};
