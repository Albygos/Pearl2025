
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getUnit, getUnits } from '@/lib/services/units';
import type { Unit, EventScore } from '@/lib/types';
import { Award, Trophy, Download } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

const getTotalScore = (unit: Unit) => {
  if (!unit.events) return 0;
  return unit.events.reduce((total, event) => total + event.score, 0);
};

const calculateRank = (allUnits: Unit[], unitId: string) => {
    const sortedUnits = [...allUnits].sort((a, b) => getTotalScore(b) - getTotalScore(a));
    let rank = 0;
    let lastScore = -1;

    for (let i = 0; i < sortedUnits.length; i++) {
        const currentUnit = sortedUnits[i];
        const currentScore = getTotalScore(currentUnit);

        if (currentScore === 0) continue;

        if (currentScore !== lastScore) {
            rank = i + 1;
            lastScore = currentScore;
        }
        
        if (currentUnit.id === unitId) {
            return rank;
        }
    }
    
    return null;
}


export default function DashboardPage() {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loggedInUnitId = localStorage.getItem('artfestlive_unit_id');
    if (!loggedInUnitId) {
      router.push('/login?returnTo=/dashboard');
      return;
    }

    setLoading(true);

    const unitRef = ref(database, `units/${loggedInUnitId}`);
    const allUnitsRef = ref(database, 'units');

    const unsubscribeUnit = onValue(unitRef, (snapshot) => {
      if (snapshot.exists()) {
        const fetchedUnit = { id: snapshot.key, ...snapshot.val() };
        setUnit(fetchedUnit);
      } else {
        // If unit not found (e.g., deleted), sign out
        localStorage.removeItem('artfestlive_unit_id');
        router.push('/login?returnTo=/dashboard');
      }
      setLoading(false);
    });

    const unsubscribeAllUnits = onValue(allUnitsRef, (snapshot) => {
        if(snapshot.exists()) {
            const unitsData = snapshot.val();
            const unitsArray = Object.keys(unitsData).map(key => ({
                id: key,
                ...unitsData[key]
            }));
            setAllUnits(unitsArray);
        }
    });

    return () => {
      unsubscribeUnit();
      unsubscribeAllUnits();
    };
  }, [router]);

  useEffect(() => {
    if (unit && allUnits.length > 0) {
        const currentScore = getTotalScore(unit);
        if (currentScore === 0) {
            setRank(null);
        } else {
            setRank(calculateRank(allUnits, unit.id));
        }
    }
  }, [unit, allUnits]);


  const handleDownloadCsv = () => {
    if (!unit) return;

    const headers = ['Event', 'Score'];
    const rows = unit.events.map(event => `"${event.name}",${event.score}`);
    const totalScoreRow = `"Total Score",${getTotalScore(unit)}`;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    csvContent += rows.join("\n");
    csvContent += "\n" + totalScoreRow;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${unit.name}_scorecard.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading || !unit) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
             <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-accent/50 min-h-full">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center text-center sm:text-left mb-8 gap-4 animate-in">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-bold mb-2">
              Welcome, {unit.name}!
            </h1>
            <p className="text-lg text-muted-foreground">Here's your current performance summary.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8 animate-in" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rank ? `#${rank}` : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on total score across all meghalas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalScore(unit)}</div>
              <p className="text-xs text-muted-foreground">
                Sum of scores from all events
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-none overflow-hidden rounded-xl animate-in" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle className="text-2xl font-headline">Your Scorecard</CardTitle>
                    <CardDescription>A detailed breakdown of your points for each event.</CardDescription>
                </div>
                <Button onClick={handleDownloadCsv}>
                    <Download className="mr-2"/>
                    Download Scorecard (CSV)
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {unit.events && unit.events.map((event, index) => (
                            <TableRow key={`${event.name}-${index}`}>
                                <TableCell className="font-medium">{event.name}</TableCell>
                                <TableCell className="text-right font-bold text-primary">{event.score}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
