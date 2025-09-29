'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2 } from 'lucide-react';
import { getUnits } from '@/lib/services/units';
import { getGalleryImages, deleteGalleryImage } from '@/lib/services/gallery';
import type { Unit, GalleryImage } from '@/lib/types';
import Link from 'next/link';

export default function ManageGalleryPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [fetchedUnits, fetchedImages] = await Promise.all([
        getUnits(),
        getGalleryImages()
      ]);
      setUnits(fetchedUnits);
      setGalleryImages(fetchedImages.reverse());
      setLoading(false);
    }
    fetchData();
  }, []);
  
  const handleDeleteImage = async (image: GalleryImage) => {
    try {
      await deleteGalleryImage(image);
      setGalleryImages(galleryImages.filter(img => img.id !== image.id));
      toast({
        title: 'Image Deleted',
        description: 'The image has been successfully removed.',
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Image',
        description: 'There was a problem deleting the image.',
        variant: 'destructive'
      });
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Manage Gallery</h1>
            <p className="text-muted-foreground">View and delete photos from the event gallery.</p>
        </div>
        <Button asChild>
            <Link href="/admin/gallery/upload">
                <Upload className="mr-2" />
                Upload New Image
            </Link>
        </Button>
      </header>

       <h2 className="text-2xl font-headline font-bold mb-4">Current Gallery</h2>
       {loading ? (
         <p>Loading images...</p>
       ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map(image => (
                <Card key={image.id} className="overflow-hidden group">
                    <CardContent className="p-0 relative">
                       <div className="aspect-video relative">
                         <Image src={image.src} alt={image.alt} fill className="object-cover" />
                       </div>
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the image.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteImage(image)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                       </div>
                    </CardContent>
                    <CardFooter className="p-3 bg-muted/50 text-xs text-muted-foreground flex-col items-start">
                       <p className="font-semibold truncate text-foreground">{image.alt}</p>
                       {image.unitId && <p>Unit: {units.find(u => u.id === image.unitId)?.name || 'N/A'}</p>}
                    </CardFooter>
                </Card>
            ))}
        </div>
       )}
       {!loading && galleryImages.length === 0 && <p className="text-muted-foreground mt-4">No images in the gallery yet.</p>}
    </div>
  );
}
