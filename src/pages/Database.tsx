
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CSVImport from '@/components/data/CSVImport';
import DataEntryForm from '@/components/data/DataEntryForm';
import { Database, Plus, Upload, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Database = () => {
  const { datasets, activeDataset, setActiveDataset, getActiveData, removeDataset } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  const data = getActiveData();
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  
  const handleDatasetChange = (value: string) => {
    setActiveDataset(value);
  };
  
  const handleDeleteDataset = () => {
    if (activeDataset) {
      if (confirm(`Are you sure you want to delete the "${activeDataset}" dataset?`)) {
        removeDataset(activeDataset);
      }
    }
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          Database Management
        </h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Your Datasets</CardTitle>
            <CardDescription>
              Manage your imported datasets or add new data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {datasets.length > 0 ? (
                  <div className="flex flex-wrap gap-4 items-center">
                    <Select value={activeDataset || undefined} onValueChange={handleDatasetChange}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasets.map(dataset => (
                          <SelectItem key={dataset.name} value={dataset.name}>
                            {dataset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {activeDataset && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDeleteDataset}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Dataset
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No datasets available</div>
                )}
                
                <div className="ml-auto flex gap-2">
                  <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Import CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <CSVImport onClose={() => setIsImportDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                  
                  {activeDataset && (
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Entry
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DataEntryForm 
                          datasetName={activeDataset} 
                          onClose={() => setIsAddDialogOpen(false)} 
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
              
              {activeDataset ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    {data.length} records in dataset
                  </div>
                  
                  <div className="rounded-md border overflow-x-auto">
                    {data.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {headers.map(header => (
                              <TableHead key={header} className="whitespace-nowrap">
                                {header.charAt(0).toUpperCase() + header.slice(1).replace('_', ' ')}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.slice(0, 10).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {headers.map(header => (
                                <TableCell key={`${rowIndex}-${header}`} className="whitespace-nowrap">
                                  {row[header]}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        This dataset is empty. Add data by importing a CSV or adding entries manually.
                      </div>
                    )}
                    {data.length > 10 && (
                      <div className="p-2 text-center text-sm text-muted-foreground border-t">
                        Showing 10 of {data.length} records
                      </div>
                    )}
                  </div>
                </>
              ) : datasets.length > 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Please select a dataset to view its data
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Get started by importing a CSV file or adding data manually
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Database;
