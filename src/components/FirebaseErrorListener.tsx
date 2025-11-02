
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A client component that listens for globally-emitted 'permission-error' events.
 * When such an event is caught, it throws the error. In a Next.js development
 * environment, this will trigger the dev overlay, displaying the rich, contextual
 * error for easier debugging of Firestore security rules. In production, this
 * will be caught by the nearest Error Boundary.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Throw the error so the Next.js overlay can catch and display it.
      // This provides a much better debugging experience than just logging to the console.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
