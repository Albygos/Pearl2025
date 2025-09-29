import { database } from '@/lib/firebase';
import { ref as dbRef, get, child, push, set, remove } from 'firebase/database';
import type { GalleryImage } from '@/lib/types';

const databaseRef = dbRef(database);

export async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const snapshot = await get(child(databaseRef, 'galleryImages'));
    if (snapshot.exists()) {
      const imagesData = snapshot.val();
      return Object.keys(imagesData).map(key => ({
        id: key,
        ...imagesData[key]
      }));
    } else {
      console.log("No images available");
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addGalleryImage(image: Omit<GalleryImage, 'id'>): Promise<string> {
  try {
    const galleryRef = child(databaseRef, 'galleryImages');
    const newImageRef = push(galleryRef);
    await set(newImageRef, image);
    if (!newImageRef.key) throw new Error("Failed to get new image key");
    return newImageRef.key;
  } catch(error) {
    console.error("Error adding gallery image: ", error);
    throw error;
  }
}

export async function deleteGalleryImage(image: GalleryImage): Promise<void> {
    try {
        // Delete from Realtime Database
        const imageDbRef = child(databaseRef, `galleryImages/${image.id}`);
        await remove(imageDbRef);
    } catch (error) {
        console.error("Error deleting gallery image: ", error);
        throw error;
    }
}
