/**
 * Utility functions for Firestore data handling
 */

/**
 * Removes undefined and null values from an object recursively
 * Firestore doesn't allow undefined values, so we need to clean data before saving
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      // Skip undefined and null values
      continue;
    }
    
    if (Array.isArray(value)) {
      // Clean arrays recursively
      cleaned[key] = value
        .filter(item => item !== undefined && item !== null)
        .map(item => 
          typeof item === 'object' && item !== null 
            ? cleanFirestoreData(item)
            : item
        );
    } else if (typeof value === 'object' && value !== null) {
      // Clean objects recursively
      const cleanedObject = cleanFirestoreData(value);
      if (Object.keys(cleanedObject).length > 0) {
        cleaned[key] = cleanedObject;
      }
    } else {
      // Keep primitive values
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

/**
 * Validates that an object doesn't contain undefined values
 * Throws an error if undefined values are found
 */
export function validateFirestoreData(data: any, path: string = 'root'): void {
  if (data === undefined) {
    throw new Error(`Undefined value found at ${path}`);
  }
  
  if (data === null || typeof data !== 'object') {
    return; // null and primitives are OK
  }
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      validateFirestoreData(item, `${path}[${index}]`);
    });
  } else {
    for (const [key, value] of Object.entries(data)) {
      validateFirestoreData(value, `${path}.${key}`);
    }
  }
}

/**
 * Safely converts a value to a Firestore-compatible format
 */
export function toFirestoreValue(value: any): any {
  if (value === undefined) {
    return null; // Convert undefined to null
  }
  
  if (value instanceof Date) {
    return value; // Firestore handles Date objects
  }
  
  if (Array.isArray(value)) {
    return value.map(toFirestoreValue);
  }
  
  if (typeof value === 'object' && value !== null) {
    const converted: any = {};
    for (const [key, val] of Object.entries(value)) {
      const convertedValue = toFirestoreValue(val);
      if (convertedValue !== null) { // Only include non-null values
        converted[key] = convertedValue;
      }
    }
    return converted;
  }
  
  return value;
}

/**
 * Creates a safe activity log entry
 */
export function createActivityLogEntry(
  userId: string,
  action: 'create' | 'update' | 'delete',
  resource: string,
  resourceId?: string,
  changes?: Record<string, any>
): Record<string, any> {
  const entry: Record<string, any> = {
    userId,
    action,
    resource,
    timestamp: new Date(), // Will be converted to serverTimestamp by Firestore service
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
  };
  
  // Only add resourceId if it's a valid string
  if (resourceId && typeof resourceId === 'string' && resourceId.trim().length > 0) {
    entry.resourceId = resourceId;
  }
  
  // Only add changes if they exist and are not empty
  if (changes && typeof changes === 'object' && Object.keys(changes).length > 0) {
    entry.changes = cleanFirestoreData(changes);
  }
  
  return cleanFirestoreData(entry);
}

/**
 * Error handler for Firestore operations
 */
export function handleFirestoreError(error: any, operation: string): Error {
  console.error(`Firestore ${operation} error:`, error);
  
  if (error.code === 'permission-denied') {
    return new Error(`Permission denied: You don't have access to perform this ${operation}. Please check your authentication and permissions.`);
  }
  
  if (error.code === 'not-found') {
    return new Error(`Document not found: The requested data doesn't exist.`);
  }
  
  if (error.code === 'already-exists') {
    return new Error(`Document already exists: Cannot create duplicate data.`);
  }
  
  if (error.code === 'resource-exhausted') {
    return new Error(`Quota exceeded: Too many requests. Please try again later.`);
  }
  
  if (error.code === 'invalid-argument') {
    return new Error(`Invalid data: The provided data contains invalid values. ${error.message}`);
  }
  
  // Generic error
  return new Error(`${operation} failed: ${error.message || 'Unknown error'}`);
}