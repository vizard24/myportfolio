import { db } from '@/lib/firebase';
import { doc, getDocs, collection, writeBatch } from 'firebase/firestore';

const CHUNK_SIZE = 500;

export async function saveLinkedInDataToFirestore(userId: string, type: 'connections' | 'messages' | 'invitations' | 'skills' | 'projects' | 'education' | 'positions' | 'recommendations', data: any[]) {
    try {
        const collectionRef = collection(db, 'users', userId, `linkedin_${type}`);
        // Read existing docs to delete them
        const existingDocs = await getDocs(collectionRef);

        let batch = writeBatch(db);
        let opCount = 0;

        // Delete existing docs (batch limit is 500 ops)
        for (const d of existingDocs.docs) {
            batch.delete(d.ref);
            opCount++;
            if (opCount === 490) { // Keep under 500 limit
                await batch.commit();
                batch = writeBatch(db);
                opCount = 0;
            }
        }

        // Now insert new chunks
        let chunkIndex = 0;
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);
            const chunkDocRef = doc(collectionRef, `chunk_${chunkIndex}`);
            batch.set(chunkDocRef, { data: chunk });
            chunkIndex++;
            opCount++;
            if (opCount === 490) {
                await batch.commit();
                batch = writeBatch(db);
                opCount = 0;
            }
        }

        if (opCount > 0) {
            await batch.commit();
        }
        console.log(`Successfully saved ${data.length} ${type} to Firestore for user ${userId}`);
    } catch (error) {
        console.error(`Error saving ${type} to Firestore:`, error);
        throw error;
    }
}

export async function loadLinkedInDataFromFirestore(userId: string, type: 'connections' | 'messages' | 'invitations' | 'skills' | 'projects' | 'education' | 'positions' | 'recommendations') {
    try {
        const collectionRef = collection(db, 'users', userId, `linkedin_${type}`);
        const snapshot = await getDocs(collectionRef);

        if (snapshot.empty) return [];

        let combinedData: any[] = [];
        snapshot.forEach((doc) => {
            const docData = doc.data();
            if (docData.data && Array.isArray(docData.data)) {
                combinedData = combinedData.concat(docData.data);
            }
        });

        console.log(`Successfully loaded ${combinedData.length} ${type} from Firestore for user ${userId}`);
        return combinedData;
    } catch (error) {
        console.error(`Error loading ${type} from Firestore:`, error);
        return [];
    }
}
