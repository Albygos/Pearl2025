import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, ImageIcon, ArrowRight, Building } from 'lucide-react';
import { getUnits } from '@/lib/services/units';
import { getGalleryImages } from '@/lib/services/gallery';
import { unstable_noStore as noStore } from 'next/cache';
import { Unit } from '@/lib/types';

const getTotalScore = (unit: Unit) => {
  if (!unit.events) return 0;
  return unit.events.reduce((total, event) => total + event.score, 0);
};

export default async function AdminDashboardPage() {
  noStore();
  const units = await getUnits();
  const galleryImages = await getGalleryImages();

  const totalUnits = units.length;
  const totalImages = galleryImages.length;
  const topScoringUnit = totalUnits > 0 ? [...units].sort((a, b) => getTotalScore(b) - getTotalScore(a))[0] : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-full">
      <header className="mb-8 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome, administrator. Here's a summary of Pearl 2025.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Megalas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              Participating megalas in the event
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Scoring Megala
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{topScoringUnit?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {topScoringUnit ? `Currently leading with ${getTotalScore(topScoringUnit)} points` : 'No megalas available'}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gallery Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImages}</div>
            <p className="text-xs text-muted-foreground">
              Total photos uploaded to the gallery
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 max-w-7xl mx-auto">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Manage Scores</CardTitle>
            <CardDescription>View and update scores for all participating megalas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/scores">Go to Scores <ArrowRight className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Manage Megalas</CardTitle>
            <CardDescription>Add new megalas or edit existing participant details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/units">Go to Megalas <ArrowRight className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
         <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Manage Gallery</CardTitle>
            <CardDescription>Upload images to the event gallery for megalas to view.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/gallery">Go to Gallery <ArrowRight className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
         <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Manage Events</CardTitle>
            <CardDescription>Add or remove event categories for the competition.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/events">Go to Events <ArrowRight className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Manage Venue</CardTitle>
            <CardDescription>Update the event venue information.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/venue">Go to Venue <ArrowRight className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}