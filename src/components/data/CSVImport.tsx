
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { toast } from '@/components/ui/sonner';
import { Upload } from 'lucide-react';

interface CSVImportProps {
  onClose?: () => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addDataset } = useData();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Use file name as default dataset name (without extension)
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setDatasetName(fileName);
    }
  };

  const parseCSV = (text: string) => {
    try {
      // Split by lines
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      // Extract headers from first line
      const headers = lines[0].split(',').map(header => header.trim());
      
      // Parse data rows
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(val => val.trim());
        const row: {[key: string]: string | number} = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          // Try to convert to number if possible
          const numberValue = Number(value);
          row[header] = !isNaN(numberValue) && value !== '' ? numberValue : value;
        });
        
        return row;
      });
      
      return data;
    } catch (err) {
      console.error("Error parsing CSV:", err);
      throw new Error("Failed to parse CSV file. Please check the format.");
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    
    if (!datasetName) {
      toast.error('Please enter a dataset name');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Read file content
      const text = await file.text();
      
      // Parse CSV data
      const parsedData = parseCSV(text);
      
      if (parsedData.length === 0) {
        toast.error('No data found in the CSV file');
        setIsLoading(false);
        return;
      }
      
      // Add dataset
      addDataset(datasetName, parsedData);
      
      // Reset form
      setFile(null);
      setDatasetName('');
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import CSV');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import CSV Data</CardTitle>
        <CardDescription>
          Upload a CSV file to create a new dataset
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="dataset-name" className="text-sm font-medium">
            Dataset Name
          </label>
          <Input
            id="dataset-name"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            placeholder="Enter dataset name"
          />
        </div>
        
        <div className="grid w-full items-center gap-2">
          <label htmlFor="csv-file" className="text-sm font-medium">
            CSV File
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1"
            />
          </div>
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected file: {file.name}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleImport}
          disabled={isLoading || !file || !datasetName}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isLoading ? 'Importing...' : 'Import Data'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CSVImport;
