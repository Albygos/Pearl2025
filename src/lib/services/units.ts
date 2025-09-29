import { database } from '@/lib/firebase';
import { ref, get, set, child, push, remove, runTransaction, update } from 'firebase/database';
import type { Unit, EventScore } from '@/lib/types';
import { getEvents } from './events';


const dbRef = ref(database);

export async function getUnits(): Promise<Unit[]> {
  try {
    const snapshot = await get(child(dbRef, 'units'));
    if (snapshot.exists()) {
      const unitsData = snapshot.val();
      const events = await getEvents();
      const eventNames = events.map(e => e.name);

      return Object.keys(unitsData).map(key => {
        const unit = unitsData[key];
        const existingEvents = unit.events || [];
        
        // Ensure unit has all current events, add missing ones with score 0
        const updatedEvents = eventNames.map(eventName => {
            const foundEvent = existingEvents.find((e: EventScore) => e.name === eventName);
            return foundEvent || { name: eventName, score: 0 };
        });

        // Filter out events that are no longer in the global events list
        const filteredEvents = existingEvents.filter((e: EventScore) => eventNames.includes(e.name));

        return {
            id: key,
            ...unit,
            events: updatedEvents.length > 0 ? updatedEvents : filteredEvents,
            score: undefined, // remove old score property if it exists
            photoAccessCount: unit.photoAccessCount || 0,
        }
      });
    } else {
      console.log("No data available");
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getUnit(id: string): Promise<Unit | null> {
    try {
        const snapshot = await get(child(dbRef, `units/${id}`));
        if (snapshot.exists()) {
            const unitData = snapshot.val();
            const events = await getEvents();
            const eventNames = events.map(e => e.name);
            const existingEvents = unitData.events || [];
            
            const updatedEvents = eventNames.map(eventName => {
                const foundEvent = existingEvents.find((e: EventScore) => e.name === eventName);
                return foundEvent || { name: eventName, score: 0 };
            });

            return { 
                id, 
                ...unitData,
                events: updatedEvents,
                score: undefined,
                photoAccessCount: unitData.photoAccessCount || 0,
            };
        } else {
            console.log("No data available for unit");
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getUnitByCredential(credentialId: string): Promise<Unit | null> {
    try {
        const snapshot = await get(child(dbRef, 'units'));
        if (snapshot.exists()) {
            const unitsData = snapshot.val();
            const unitId = Object.keys(unitsData).find(key => unitsData[key].credentialId === credentialId);
            if (unitId) {
                return getUnit(unitId);
            }
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateUnitEvents(unitId: string, events: EventScore[]): Promise<void> {
    try {
        const eventsRef = child(dbRef, `units/${unitId}/events`);
        await set(eventsRef, events);
    } catch (error) {
        console.error("Error updating unit events:", error);
        throw error;
    }
}


export async function updateUnitScore(unitId: string, eventName: string, newScore: number): Promise<void> {
    try {
        const unitRef = child(dbRef, `units/${unitId}`);
        await runTransaction(unitRef, (unit) => {
            if (unit) {
                if (!unit.events || !Array.isArray(unit.events)) {
                    unit.events = [];
                }
                const eventIndex = unit.events.findIndex((e: any) => e && e.name === eventName);
                if (eventIndex > -1) {
                    unit.events[eventIndex].score = newScore;
                } else {
                    unit.events.push({ name: eventName, score: newScore });
                }
            }
            return unit;
        });
    } catch (error) {
        console.error("Error updating score:", error);
        throw error;
    }
}

export async function incrementUnitPhotoAccessCount(id: string): Promise<void> {
    try {
        const unitRef = child(dbRef, `units/${id}/photoAccessCount`);
        await runTransaction(unitRef, (currentCount) => {
            return (currentCount || 0) + 1;
        });
    } catch (error) {
        console.error("Error incrementing photo access count:", error);
        // Don't throw, as this is not a critical failure
    }
}

export async function addUnit(unit: Omit<Unit, 'id' | 'events' | 'photoAccessCount'>): Promise<string> {
    try {
        const allEvents = await getEvents();
        const initialEvents = allEvents.map(event => ({ name: event.name, score: 0 }));

        const newUnitRef = child(ref(database), 'units');
        const newUnitKey = push(newUnitRef).key;
        if (!newUnitKey) throw new Error("Failed to generate a new key for the unit");

        const unitToAdd = {
            name: unit.name,
            credentialId: unit.credentialId,
            photoAccessCount: 0,
            events: initialEvents,
        };

        const unitRef = child(dbRef, `units/${newUnitKey}`);
        await set(unitRef, unitToAdd);
        return newUnitKey;
    } catch (error) {
        console.error("Error adding unit:", error);
        throw error;
    }
}

export async function updateUnit(unitId: string, data: Partial<Unit>): Promise<void> {
    try {
        const unitRef = child(dbRef, `units/${unitId}`);
        await update(unitRef, data);
    } catch (error) {
        console.error("Error updating unit: ", error);
        throw error;
    }
}

export async function deleteUnit(id: string): Promise<void> {
    try {
        const unitRef = child(dbRef, `units/${id}`);
        await remove(unitRef);
    } catch (error) {
        console.error("Error deleting unit:", error);
        throw error;
    }
}
