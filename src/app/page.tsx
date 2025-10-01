
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import type { Unit, AppEvent, EventScore } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';


const getTotalScore = (unit: Unit) => {
  if (!unit.events) return 0;
  return unit.events.reduce((total, event) => total + event.score, 0);
};

export default function Home() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedCells, setHighlightedCells] = useState<Record<string, boolean>>({});
  const prevUnitsRef = useRef<Unit[]>([]);

  useEffect(() => {
    setLoading(true);
    const unitsRef = ref(database, 'units');
    const eventsRef = ref(database, 'events');

    const unsubscribeUnits = onValue(unitsRef, (snapshot) => {
        if (snapshot.exists()) {
            const unitsData = snapshot.val();
            const unitsArray: Unit[] = Object.keys(unitsData).map(key => ({
                id: key,
                ...unitsData[key]
            }));

            if (prevUnitsRef.current.length > 0) {
              const newHighlights: Record<string, boolean> = {};
              unitsArray.forEach(unit => {
                const prevUnit = prevUnitsRef.current.find(u => u.id === unit.id);
                if (prevUnit && unit.events && prevUnit.events) {
                  unit.events.forEach(eventScore => {
                    const prevEventScore = prevUnit.events.find(e => e.name === eventScore.name);
                    if (!prevEventScore || prevEventScore.score !== eventScore.score) {
                       const key = `${unit.id}-${eventScore.name}`;
                       newHighlights[key] = true;
                    }
                  });
                }
              });
              
              if(Object.keys(newHighlights).length > 0) {
                setHighlightedCells(prev => ({...prev, ...newHighlights}));
                Object.keys(newHighlights).forEach(key => {
                    setTimeout(() => {
                        setHighlightedCells(prev => {
                            const newPrev = {...prev};
                            delete newPrev[key];
                            return newPrev;
                        });
                    }, 60000);
                });
              }
            }
            
            setUnits(unitsArray);
            prevUnitsRef.current = unitsArray;

        } else {
            setUnits([]);
            prevUnitsRef.current = [];
        }
        setLoading(false);
    });

    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
        if (snapshot.exists()) {
            const eventsData = snapshot.val();
            const eventsArray = Object.keys(eventsData).map(key => ({
                id: key,
                ...eventsData[key]
            }));
            setEvents(eventsArray);
        } else {
            setEvents([]);
        }
    });


    return () => {
        unsubscribeUnits();
        unsubscribeEvents();
    };
  }, []);
  
  const sortedUnits = useMemo(() => {
    return [...units].sort((a, b) => getTotalScore(b) - getTotalScore(a));
  }, [units]);
  
  const rankedUnits = useMemo(() => {
    let rank = 0;
    let lastScore = -1;
    return sortedUnits.map((unit, index) => {
      const score = getTotalScore(unit);
      if (score === 0) {
        return { ...unit, rank: null };
      }
      if (score !== lastScore) {
        rank = index + 1;
      }
      lastScore = score;
      return { ...unit, rank };
    });
  }, [sortedUnits]);

  const filteredUnits = useMemo(() => {
    if (!searchTerm) {
      return rankedUnits;
    }
    return rankedUnits.filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rankedUnits, searchTerm]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <section className="text-center mb-12 animate-in" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-headline font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-yellow-500">Pearl 2025</h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto animate-in" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
            Let Talent Speak.
          </p>
        </section>

        <div className="max-w-6xl mx-auto animate-in" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-primary/10 overflow-hidden rounded-xl">
            <CardHeader className="text-center bg-muted/30 p-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div>
                    <CardTitle className="text-3xl font-headline">Live Scoreboard</CardTitle>
                    <CardDescription>Real-time results from all event categories</CardDescription>
                </div>
                 <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search meghalas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background/50 focus:ring-accent"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                 {loading ? (
                    <div className="space-y-1 p-4">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent text-xs uppercase tracking-wider">
                      <TableHead className="w-16 text-center font-bold text-foreground px-2 sm:px-4">Rank</TableHead>
                      <TableHead className="font-bold text-foreground min-w-[120px] px-2 sm:px-4">Meghala</TableHead>
                      {events.map(event => (
                        <TableHead key={event.id} className="text-center font-bold text-foreground px-2 sm:px-4">{event.name}</TableHead>
                      ))}
                      <TableHead className="text-right font-bold text-foreground px-2 sm:px-4">Total Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnits.map((unit) => (
                      <TableRow 
                        key={unit.id} 
                        className="font-medium animate-in"
                      >
                        <TableCell className="font-bold text-center text-lg sm:text-xl text-primary px-2 sm:px-4">
                            {unit.rank ?? '-'}
                        </TableCell>
                        <TableCell className="font-semibold text-sm sm:text-base px-2 sm:px-4">{unit.name}</TableCell>
                        {events.map(event => (
                          <TableCell key={event.id} className={`text-center text-foreground font-bold transition-all duration-1000 px-2 sm:px-4 ${highlightedCells[`${unit.id}-${event.name}`] ? 'animate-flash' : ''}`}>
                            {unit.events?.find(e => e.name === event.name)?.score ?? 0}
                          </TableCell>
                        ))}
                        <TableCell className="text-right text-primary font-bold px-2 sm:px-4">{getTotalScore(unit)}</TableCell>
                      </TableRow>
                    ))}
                    {filteredUnits.length === 0 && !loading && (
                         <TableRow>
                            <TableCell colSpan={events.length + 3} className="text-center py-16 text-muted-foreground">
                                <p>No meghalas found matching "{searchTerm}".</p>
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
                )}
                {!loading && units.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <p>The scoreboard is currently empty.</p>
                    <p>Check back soon for live updates!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {filteredUnits.length > 0 && (
          <section className="max-w-6xl mx-auto mt-12 animate-in" style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
            <h2 className="text-3xl font-headline font-bold text-center mb-8">Top Meghalas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredUnits.slice(0, 3).map((unit) => (
                <Card key={unit.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="text-4xl font-bold text-primary">{unit.rank ?? '-'}</div>
                    <div>
                      <CardTitle className="text-xl">{unit.name}</CardTitle>
                      <CardDescription>Current Rank: {unit.rank ?? '-'}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-muted-foreground">Total Score</span>
                      <span className="font-bold text-primary">{getTotalScore(unit)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
