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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUnits, addUnit, updateUnit, deleteUnit } from '@/lib/services/units';
import type { Unit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader, Plus, Trash2, Search, Download, Edit } from 'lucide-react';
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

const getTotalScore = (unit: Unit) => {
  if (!unit.events) return 0;
  return unit.events.reduce((total, event) => total + event.score, 0);
};


export default function ManageUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCredentialId, setNewUnitCredentialId] = useState('');
  
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingUnitName, setEditingUnitName] = useState('');
  const [editingUnitCredentialId, setEditingUnitCredentialId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

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
    return units.filter(unit => {
      const nameMatch = unit.name && unit.name.toLowerCase().includes(searchTerm.toLowerCase());
      const credentialIdMatch = unit.credentialId && unit.credentialId.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || credentialIdMatch;
    });
  }, [units, searchTerm]);
  
  const generateCredentialId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  const handleAddUnit = async () => {
    if (newUnitName && newUnitCredentialId) {
      const newUnit: Omit<Unit, 'id' | 'events' | 'photoAccessCount'> = {
        name: newUnitName,
        credentialId: newUnitCredentialId,
      };
      try {
        const newUnitId = await addUnit(newUnit);
        const addedUnit = await getUnits().then(units => units.find(u => u.id === newUnitId));
        if (addedUnit) {
          setUnits([...units, addedUnit]);
        }
        toast({
          title: 'Meghala Added',
          description: `"${newUnitName}" has been added to the event.`,
        });
        setIsAddDialogOpen(false);
        setNewUnitName('');
        setNewUnitCredentialId('');
      } catch (error) {
        toast({
            title: 'Error Adding Meghala',
            description: `There was a problem saving the new meghala.`,
            variant: 'destructive'
        });
      }
    } else {
        toast({
            title: 'Missing Information',
            description: `Please provide a name and credential ID.`,
            variant: 'destructive'
        });
    }
  };

  const openEditDialog = (unit: Unit) => {
    setEditingUnit(unit);
    setEditingUnitName(unit.name);
    setEditingUnitCredentialId(unit.credentialId);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUnit = async () => {
    if (!editingUnit || !editingUnitName || !editingUnitCredentialId) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and credential ID.',
        variant: 'destructive'
      });
      return;
    }
    
    const updatedData: Partial<Unit> = {
      name: editingUnitName,
      credentialId: editingUnitCredentialId,
    };

    try {
      await updateUnit(editingUnit.id, updatedData);
      setUnits(units.map(u => u.id === editingUnit.id ? { ...u, ...updatedData } : u));
      toast({
        title: 'Meghala Updated',
        description: 'The meghala details have been successfully updated.',
      });
      setIsEditDialogOpen(false);
      setEditingUnit(null);
    } catch (error) {
      toast({
        title: 'Error Updating Meghala',
        description: 'There was a problem updating the meghala.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      await deleteUnit(unitId);
      setUnits(units.filter(u => u.id !== unitId));
      toast({
        title: 'Meghala Deleted',
        description: 'The meghala has been successfully removed.',
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Meghala',
        description: 'There was a problem deleting the meghala.',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadUnitCredentials = () => {
    const headers = ['Meghala', 'Credential ID'];
    const rows = units.map(unit => `"${unit.name}","${unit.credentialId}"`);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    csvContent += rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "meghala_credentials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadUnitScorecard = (unit: Unit) => {
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
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold">Manage Meghalas</h1>
          <p className="text-muted-foreground">Add, edit, or delete participating meghalas.</p>
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
            <Button onClick={handleDownloadUnitCredentials} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Credentials
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="flex-shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Meghala
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Meghala</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the new meghala. It will be initialized with 0 points for all events.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Meghala Name</Label>
                            <Input id="name" value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)} className="col-span-3" placeholder="Creative name"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="credentialId" className="text-right">Credential ID</Label>
                            <div className="col-span-3 flex items-center gap-2">
                               <Input id="credentialId" value={newUnitCredentialId} onChange={(e) => setNewUnitCredentialId(e.target.value)} placeholder="Unique ID for login"/>
                               <Button variant="outline" size="sm" onClick={() => setNewUnitCredentialId(generateCredentialId())}>Generate</Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" onClick={handleAddUnit}>Add Meghala</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
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
                    <TableHead>Meghala</TableHead>
                    <TableHead className="hidden sm:table-cell">Credential ID</TableHead>
                    <TableHead className="text-right">Total Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => (
                    <TableRow key={unit.id} className="hover:bg-accent/50 transition-colors">
                      <TableCell className="font-medium truncate max-w-[150px] sm:max-w-xs">{unit.name}</TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-xs">{unit.credentialId}</TableCell>
                      <TableCell className="text-right font-bold">{getTotalScore(unit)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditDialog(unit)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleDownloadUnitScorecard(unit)}>
                                <Download className="h-4 w-4" />
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
                                    This action cannot be undone. This will permanently delete the meghala "{unit.name}".
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUnit(unit.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUnits.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
      
      {/* Edit Meghala Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Meghala</DialogTitle>
                <DialogDescription>
                    Update the details for "{editingUnit?.name}".
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">Meghala Name</Label>
                    <Input id="edit-name" value={editingUnitName} onChange={(e) => setEditingUnitName(e.target.value)} className="col-span-3"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-credentialId" className="text-right">Credential ID</Label>
                    <Input id="edit-credentialId" value={editingUnitCredentialId} onChange={(e) => setEditingUnitCredentialId(e.target.value)} className="col-span-3"/>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" onClick={handleUpdateUnit}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
