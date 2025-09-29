'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Paintbrush, Clock } from 'lucide-react';
import { getVenueDetails } from '@/lib/services/venue';
import type { VenueDetails } from '@/lib/types';

export default function VenuePage() {
  const [allDetails, setAllDetails] = useState<VenueDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const venueData = await getVenueDetails();
        setAllDetails(venueData); // Already sorted by timestamp desc
      } catch (error) {
        console.error("Failed to fetch venue details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-background min-h-full">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <section className="text-center mb-12 animate-in w-full max-w-3xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-headline font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-yellow-500">
            Event Venues
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Find out what's happening and where. Here is the list of all event locations.
          </p>
        </section>

        <div className="w-full max-w-3xl space-y-6">
            {loading ? (
              <>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </>
            ) : allDetails.length > 0 ? (
                allDetails.map((detail, index) => (
                    <Card key={detail.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-primary/10 rounded-xl animate-in" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Paintbrush className="text-primary h-6 w-6" />
                                <span className="text-2xl">{detail.item}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-lg">
                                <Building className="text-muted-foreground h-5 w-5"/>
                                <span className="font-semibold">Room / Hall:</span>
                                <span>{detail.roomNumber}</span>
                            </div>
                             <div className="text-sm text-muted-foreground flex items-center gap-2 pt-4 border-t">
                                <Clock className="h-4 w-4" />
                                <span>Updated: {new Date(detail.timestamp).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
              <div className="text-center py-24 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground text-xl">Venue details have not been set yet.</p>
                <p className="text-md text-muted-foreground mt-2">Please check back later!</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
