'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader } from 'lucide-react';
import { getUnits } from '@/lib/services/units';
import { addGalleryImage } from '@/lib/services/gallery';
import type { Unit, GalleryImage } from '@/lib/types';

export default function UploadGalleryPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [aiHint, setAiHint] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('none');
  const router = useRouter();

  const { toast } = useToast();

  useEffect(() => {
    async function fetchUnits() {
      setLoadingUnits(true);
      const fetchedUnits = await getUnits();
      setUnits(fetchedUnits);
      setLoadingUnits(false);
    }
    fetchUnits();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      setAltText(file.name.split('.').slice(0, -1).join('.').replace(/[-_]/g, ' '));
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !altText) {
        toast({
            title: 'Missing Information',
            description: 'Please select a file and provide alt text.',
            variant: 'destructive'
        });
        return;
    }

    setUploading(true);
    try {
        const dataUrl = await fileToDataUrl(selectedFile);

        const newImage: Omit<GalleryImage, 'id'> = {
            src: dataUrl,
            alt: altText,
            aiHint: aiHint,
            ...(selectedUnitId && selectedUnitId !== 'none' && { unitId: selectedUnitId }),
        };
        
        await addGalleryImage(newImage);

        toast({
            title: 'Upload Successful',
            description: 'The new image has been added to the gallery.'
        });
        router.push('/admin/gallery');

    } catch (error) {
        console.error(error);
        toast({
            title: 'Upload Failed',
            description: 'There was an error uploading the image.',
            variant: 'destructive'
        });
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-start">
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Upload New Image</CardTitle>
                <CardDescription>Select an image and provide details to add it to the gallery.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Picture</Label>
                <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
                </div>
                {previewUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                </div>
                )}
                <div className="grid gap-2">
                <Label htmlFor="alt-text">Alt Text (Description)</Label>
                <Textarea id="alt-text" placeholder="A detailed description of the image" value={altText} onChange={(e) => setAltText(e.target.value)} />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="ai-hint">AI Hint</Label>
                <Input id="ai-hint" placeholder="e.g. 'abstract painting'" value={aiHint} onChange={(e) => setAiHint(e.target.value)} />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="unit-select">Assign to Unit (Optional)</Label>
                <Select onValueChange={setSelectedUnitId} value={selectedUnitId} disabled={loadingUnits}>
                    <SelectTrigger id="unit-select">
                        <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {units.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? <Loader className="mr-2 animate-spin" /> : <Upload className="mr-2"/>}
                    Upload Image
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
