import { database } from '@/lib/firebase';
import { ref, get, set, child, push, remove, update, runTransaction } from 'firebase/database';
import type { AppEvent, Unit, EventScore } from '@/lib/types';
import { getUnits, updateUnitEvents } from './units';

const dbRef = ref(database);

export async function getEvents(): Promise<AppEvent[]> {
  try {
    const snapshot = await get(child(dbRef, 'events'));
    if (snapshot.exists()) {
      const eventsData = snapshot.val();
      return Object.keys(eventsData).map(key => ({
        id: key,
        ...eventsData[key]
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addEvent(eventName: string): Promise<string> {
  if (!eventName) {
    throw new Error("Event name cannot be empty.");
  }
  try {
    // Add the new event to the /events node
    const eventsRef = child(dbRef, 'events');
    const newEventRef = push(eventsRef);
    await set(newEventRef, { name: eventName });
    const newEventId = newEventRef.key;
    if (!newEventId) throw new Error("Failed to get new event key");

    // Add the new event to all existing units with a score of 0
    const units = await getUnits();
    const updatePromises = units.map(unit => {
      const newEvent = { name: eventName, score: 0 };
      // Handle case where unit.events might be undefined
      const updatedEvents = [...(unit.events || []), newEvent];
      return updateUnitEvents(unit.id, updatedEvents);
    });
    await Promise.all(updatePromises);
    
    return newEventId;
  } catch(error) {
    console.error("Error adding event: ", error);
    throw error;
  }
}

export async function updateEvent(eventId: string, oldName: string, newName: string): Promise<void> {
    if (!eventId || !oldName || !newName) {
        throw new Error("Missing parameters for updating event.");
    }
    try {
        // Update the event name in the /events node
        const eventRef = child(dbRef, `events/${eventId}`);
        await update(eventRef, { name: newName });

        // Update the event name in all units' event lists while preserving scores
        const unitsSnapshot = await get(child(dbRef, 'units'));
        if (unitsSnapshot.exists()) {
            const unitsData = unitsSnapshot.val();
            const updates: { [key: string]: any } = {};
            
            for (const unitId in unitsData) {
                const unit = unitsData[unitId];
                if (unit.events && Array.isArray(unit.events)) {
                    const eventIndex = unit.events.findIndex((e: EventScore) => e.name === oldName);
                    if (eventIndex > -1) {
                        // This preserves the score and only changes the name
                        updates[`/units/${unitId}/events/${eventIndex}/name`] = newName;
                    }
                }
            }
            
            if (Object.keys(updates).length > 0) {
                await update(dbRef, updates);
            }
        }
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
}


export async function deleteEvent(eventId: string, eventName: string): Promise<void> {
    try {
        // Delete the event from the /events node
        const eventRef = child(dbRef, `events/${eventId}`);
        await remove(eventRef);

        // Remove the event from all existing units
        const units = await getUnits();
        const updatePromises = units.map(unit => {
            const updatedEvents = unit.events.filter(e => e.name !== eventName);
            return updateUnitEvents(unit.id, updatedEvents);
        });
        await Promise.all(updatePromises);
    } catch (error) {
        console.error("Error deleting event: ", error);
        throw error;
    }
}
