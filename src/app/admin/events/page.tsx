'use client';

import { useState, useEffect } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getEvents, addEvent, deleteEvent, updateEvent } from '@/lib/services/events';
import type { AppEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function ManageEventsPage() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
  const [editingEventName, setEditingEventName] = useState('');
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    const fetchedEvents = await getEvents();
    setEvents(fetchedEvents);
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    if (newEventName) {
      try {
        await addEvent(newEventName);
        await fetchEvents();
        toast({
          title: 'Event Added',
          description: `"${newEventName}" has been added to the competition.`,
        });
        setIsAddDialogOpen(false);
        setNewEventName('');
      } catch (error) {
        toast({
            title: 'Error Adding Event',
            description: `There was a problem saving the new event.`,
            variant: 'destructive'
        });
      }
    } else {
        toast({
            title: 'Missing Information',
            description: `Please provide a name for the event.`,
            variant: 'destructive'
        });
    }
  };

  const openEditDialog = (event: AppEvent) => {
    setEditingEvent(event);
    setEditingEventName(event.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !editingEventName) {
        toast({
            title: 'Missing Information',
            description: 'Please provide a new name for the event.',
            variant: 'destructive'
        });
        return;
    }

    try {
        await updateEvent(editingEvent.id, editingEvent.name, editingEventName);
        await fetchEvents();
        toast({
            title: 'Event Renamed',
            description: `"${editingEvent.name}" has been renamed to "${editingEventName}".`,
        });
        setIsEditDialogOpen(false);
        setEditingEvent(null);
        setEditingEventName('');
    } catch (error) {
        toast({
            title: 'Error Renaming Event',
            description: 'There was a problem renaming the event.',
            variant: 'destructive'
        });
    }
  };

  const handleDeleteEvent = async (event: AppEvent) => {
    try {
      await deleteEvent(event.id, event.name);
      setEvents(events.filter(e => e.id !== event.id));
      toast({
        title: 'Event Deleted',
        description: `The event "${event.name}" has been successfully removed.`,
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Event',
        description: 'There was a problem deleting the event.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold">Manage Events</h1>
          <p className="text-muted-foreground">Add, rename, or remove event categories for the competition.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                        Enter the name for the new event category.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Event Name</Label>
                        <Input id="name" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} className="col-span-3" placeholder="e.g., 'Sculpture Contest'"/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleAddEvent}>Add Event</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </header>
      <Card>
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
                    <TableHead>Event Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="hover:bg-accent/50 transition-colors">
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditDialog(event)}>
                            <Edit className="h-4 w-4" />
                         </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the event "{event.name}" and all associated scores from every unit.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEvent(event)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                   {events.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                            No events created yet.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Rename Event</DialogTitle>
                <DialogDescription>
                    Enter the new name for the event "{editingEvent?.name}".
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">New Name</Label>
                    <Input id="edit-name" value={editingEventName} onChange={(e) => setEditingEventName(e.target.value)} className="col-span-3"/>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" onClick={handleUpdateEvent}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
