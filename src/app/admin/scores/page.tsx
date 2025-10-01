'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUnits, updateUnitScore } from '@/lib/services/units';
import { getEvents } from '@/lib/services/events';
import type { Unit, EventScore, AppEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Download } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';


type SelectedScore = {
  unit: Unit;
  event: EventScore;
}

const getTotalScore = (unit: Unit) => {
  if (!unit.events) return 0;
  return unit.events.reduce((total, event) => total + event.score, 0);
};

export default function ManageScoresPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState<SelectedScore | null>(null);
  const [newScore, setNewScore] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const unitsRef = ref(database, 'units');
    const eventsRef = ref(database, 'events');

    const unsubscribeUnits = onValue(unitsRef, (snapshot) => {
        if (snapshot.exists()) {
            const unitsData = snapshot.val();
            const unitsArray = Object.keys(unitsData).map(key => ({
                id: key,
                ...unitsData[key]
            }));
            setUnits(unitsArray);
        } else {
            setUnits([]);
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
    return [...units].sort((a,b) => getTotalScore(b) - getTotalScore(a));
  }, [units]);

  const filteredUnits = useMemo(() => {
    if (!searchTerm) return sortedUnits;
    return sortedUnits.filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedUnits, searchTerm]);

  const handleEditClick = (unit: Unit, event: EventScore) => {
    setSelectedScore({ unit, event });
    setNewScore(event.score.toString());
    setIsDialogOpen(true);
  };

  const handleScoreUpdate = async () => {
    if (selectedScore && newScore) {
      const scoreValue = parseInt(newScore, 10);
      try {
        await updateUnitScore(selectedScore.unit.id, selectedScore.event.name, scoreValue);
        // No local state update needed, real-time listener will handle it
        toast({
          title: 'Score Updated',
          description: `${selectedScore.unit.name}'s score for ${selectedScore.event.name} has been updated to ${newScore}.`,
        });
      } catch (error) {
         toast({
          title: 'Error',
          description: `Failed to update score.`,
          variant: 'destructive'
        });
      }
      
      setIsDialogOpen(false);
      setSelectedScore(null);
      setNewScore('');
    }
  };

  const handleDownloadFullScoreboard = () => {
    if (units.length === 0 || events.length === 0) return;

    const unitsToDownload = [...units].sort((a,b) => getTotalScore(b) - getTotalScore(a));

    const headers = ['Rank', 'Meghala', ...events.map(e => e.name), 'Total Score'];
    
    const rows = unitsToDownload.map((unit, index) => {
      const rank = index + 1;
      const unitName = `"${unit.name}"`;
      const eventScores = events.map(event => unit.events.find(e => e.name === event.name)?.score ?? 0);
      const totalScore = getTotalScore(unit);
      return [rank, unitName, ...eventScores, totalScore].join(',');
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    csvContent += rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "full_scoreboard.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Manage Scores</h1>
            <p className="text-muted-foreground">Update scores for participating meghalas across all events.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search meghalas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
             <Button onClick={handleDownloadFullScoreboard} variant="outline">
                <Download className="mr-2" />
                Download Scoreboard (CSV)
            </Button>
        </div>
      </header>
      <Card className="shadow-sm hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          {loading ? (
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meghala</TableHead>
                  {events.map(event => (
                      <TableHead key={event.id} className="text-center">{event.name}</TableHead>
                  ))}
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium truncate max-w-xs">{unit.name}</TableCell>
                    {events.map(event => (
                       <TableCell key={event.id} className="text-center">
                         <Button variant="link" size="sm" onClick={() => handleEditClick(unit, unit.events.find(e => e.name === event.name) || { name: event.name, score: 0 } )}>
                          {unit.events.find(e => e.name === event.name)?.score ?? 0}
                        </Button>
                       </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">{getTotalScore(unit)}</TableCell>
                  </TableRow>
                ))}
                 {filteredUnits.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={events.length + 2} className="text-center text-muted-foreground py-8">
                           No meghalas found matching "{searchTerm}".
                        </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Score for {selectedScore?.unit.name}</DialogTitle>
            <DialogDescription>
              Enter the new score for {selectedScore?.event.name}. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right">
                New Score
              </Label>
              <Input
                id="score"
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleScoreUpdate}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
