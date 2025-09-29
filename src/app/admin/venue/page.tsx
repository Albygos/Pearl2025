
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader, Plus, Trash2, Edit, Download } from 'lucide-react';
import type { VenueDetails, AppEvent } from '@/lib/types';
import {
  getVenueDetails,
  addVenueDetails,
  updateVenueDetails,
  deleteVenueDetails,
} from '@/lib/services/venue';
import { getEvents } from '@/lib/services/events';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ManageVenuePage() {
  const [details, setDetails] = useState<VenueDetails[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newItem, setNewItem] = useState('');

  const [editingVenue, setEditingVenue] = useState<VenueDetails | null>(null);

  const { toast } = useToast();

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [currentDetails, currentEvents] = await Promise.all([
        getVenueDetails(),
        getEvents(),
      ]);
      setDetails(currentDetails.sort((a, b) => b.timestamp - a.timestamp));
      setEvents(currentEvents);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch venue details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleAdd = async () => {
    if (!newRoomNumber || !newItem) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out both fields.',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);
    try {
      await addVenueDetails({ roomNumber: newRoomNumber, item: newItem });
      toast({
        title: 'Success!',
        description: 'New venue details have been added.',
      });
      await fetchDetails(); // Refresh list
      setIsAddDialogOpen(false);
      setNewRoomNumber('');
      setNewItem('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add venue details.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingVenue || !editingVenue.roomNumber || !editingVenue.item) {
       toast({
        title: 'Missing Information',
        description: 'Please fill out both fields.',
        variant: 'destructive',
      });
      return;
    }
     setIsSaving(true);
     try {
        await updateVenueDetails(editingVenue.id, { roomNumber: editingVenue.roomNumber, item: editingVenue.item });
        toast({
            title: 'Success!',
            description: 'Venue details have been updated.',
        });
        await fetchDetails();
        setIsEditDialogOpen(false);
        setEditingVenue(null);
     } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to update venue details.',
            variant: 'destructive',
        });
     } finally {
        setIsSaving(false);
     }
  }

  const handleDelete = async (venueId: string) => {
    try {
      await deleteVenueDetails(venueId);
      toast({
        title: 'Success!',
        description: 'Venue entry has been deleted.',
      });
      await fetchDetails();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete venue entry.',
        variant: 'destructive',
      });
    }
  };
  
  const openEditDialog = (venue: VenueDetails) => {
    setEditingVenue(venue);
    setIsEditDialogOpen(true);
  }

  const handleDownloadCsv = () => {
    const headers = ['Room Number', 'Item/Event'];
    const rows = details.map(d => 
        [
            `"${d.roomNumber}"`,
            `"${d.item}"`
        ].join(',')
    );

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    csvContent += rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "venue_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Manage Venue</h1>
            <p className="text-muted-foreground">Manage the event venue locations and history.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleDownloadCsv} variant="outline" disabled={details.length === 0}>
                <Download className="mr-2" />
                Download CSV
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2" />
                        Add New Venue
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Venue Entry</DialogTitle>
                        <DialogDescription>Create a new venue entry. This will become the current venue shown to users.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-room" className="text-right">Room Number</Label>
                            <Input id="new-room" value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} className="col-span-3" placeholder="e.g., 'Hall A'"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-item" className="text-right">Item/Event</Label>
                            <Select onValueChange={setNewItem} value={newItem}>
                              <SelectTrigger id="new-item" className="col-span-3">
                                <SelectValue placeholder="Select an event" />
                              </SelectTrigger>
                              <SelectContent>
                                {events.map(event => (
                                  <SelectItem key={event.id} value={event.name}>{event.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={isSaving}>
                            {isSaving && <Loader className="mr-2 animate-spin" />}
                            Add Entry
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Venue History</CardTitle>
          <CardDescription>The most recent entry is what is currently displayed to all users.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Item/Event</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell>{new Date(venue.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{venue.roomNumber}</TableCell>
                      <TableCell>{venue.item}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(venue)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this venue entry.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(venue.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {details.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No venue history yet. Add an entry to get started.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Venue Entry</DialogTitle>
            <DialogDescription>Update the details for this venue entry.</DialogDescription>
          </DialogHeader>
          {editingVenue && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-room" className="text-right">Room Number</Label>
                <Input id="edit-room" value={editingVenue.roomNumber} onChange={(e) => setEditingVenue({...editingVenue, roomNumber: e.target.value})} className="col-span-3"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-item" className="text-right">Item/Event</Label>
                <Select
                  onValueChange={(value) => setEditingVenue({ ...editingVenue, item: value })}
                  value={editingVenue.item}
                >
                  <SelectTrigger id="edit-item" className="col-span-3">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.name}>{event.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving && <Loader className="mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    
