import { database } from '@/lib/firebase';
import { ref, get, set, child, push, serverTimestamp, remove, update } from 'firebase/database';
import type { VenueDetails } from '@/lib/types';

const dbRef = ref(database);
const VENUE_PATH = 'venue';

/**
 * Fetches the complete history of venue details, sorted with newest first.
 * @returns A promise that resolves to an array of VenueDetails objects.
 */
export async function getVenueDetails(): Promise<VenueDetails[]> {
  try {
    const snapshot = await get(child(dbRef, VENUE_PATH));
    if (snapshot.exists()) {
      const venuesData = snapshot.val();
      return Object.keys(venuesData)
        .map(key => ({
            id: key,
            ...venuesData[key]
        }))
        .sort((a, b) => b.timestamp - a.timestamp); // Sort descending
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching venue details:", error);
    throw error;
  }
}

/**
 * Fetches the single most recent venue detail.
 * @returns A promise that resolves to the latest VenueDetails object or null if none exist.
 */
export async function getLatestVenueDetails(): Promise<VenueDetails | null> {
    const allDetails = await getVenueDetails();
    return allDetails.length > 0 ? allDetails[0] : null;
}

/**
 * Adds a new venue entry to the database.
 * @param details The new venue details to save.
 * @returns A promise that resolves with the key of the new entry.
 */
export async function addVenueDetails(details: Omit<VenueDetails, 'id' | 'timestamp'>): Promise<string> {
  if (!details || !details.roomNumber || !details.item) {
    throw new Error("Venue details must include a room number and an item.");
  }
  try {
    const venueListRef = child(dbRef, VENUE_PATH);
    const newVenueRef = push(venueListRef);
    await set(newVenueRef, { 
        ...details,
        timestamp: serverTimestamp()
    });
    return newVenueRef.key!;
  } catch (error) {
    console.error("Error adding venue details:", error);
    throw error;
  }
}

/**
 * Updates an existing venue entry in the database.
 * @param venueId The ID of the venue entry to update.
 * @param details The partial venue details to update.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateVenueDetails(venueId: string, details: Partial<Omit<VenueDetails, 'id'| 'timestamp'>>): Promise<void> {
    try {
        const venueRef = child(dbRef, `${VENUE_PATH}/${venueId}`);
        await update(venueRef, details);
    } catch (error) {
        console.error("Error updating venue details:", error);
        throw error;
    }
}


/**
 * Deletes a specific venue entry from the database.
 * @param venueId The ID of the venue entry to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteVenueDetails(venueId: string): Promise<void> {
    try {
        const venueRef = child(dbRef, `${VENUE_PATH}/${venueId}`);
        await remove(venueRef);
    } catch (error) {
        console.error("Error deleting venue details:", error);
        throw error;
    }
}
