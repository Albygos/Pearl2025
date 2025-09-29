'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Unit } from '@/lib/types';
import { BarChart, Eye, Star, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getUnits } from '@/lib/services/units';

const getTotalScore = (unit: Unit) => {
  if (!unit.events) return 0;
  return unit.events.reduce((total, event) => total + event.score, 0);
};

export default function PerformancePage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => {
    async function fetchUnits() {
      setLoading(true);
      const fetchedUnits = await getUnits();
      setUnits(fetchedUnits);
      setLoading(false);
    }
    fetchUnits();
  }, []);

  const filteredUnits = useMemo(() => {
    return units.filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold">Megala Performance</h1>
          <p className="text-muted-foreground">
            View performance metrics for each megala.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search megalas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
      </header>
       {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredUnits.map(unit => (
          <Card key={unit.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                {unit.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="flex items-center justify-between text-sm border p-3 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>Total Score</span>
                </div>
                <span className="font-bold text-lg">{getTotalScore(unit)}</span>
              </div>
              <div className="flex items-center justify-between text-sm border p-3 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Photo Accesses</span>
                </div>
                <span className="font-bold text-lg">{unit.photoAccessCount}</span>
              </div>
            </CardContent>
          </Card>
        ))}
         {filteredUnits.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 text-center text-muted-foreground py-16">
              No megalas found matching "{searchTerm}".
            </div>
        )}
      </div>
      )}
    </div>
  );
}
