
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { toast } from '@/components/ui/sonner';
import { Plus } from 'lucide-react';

interface DataEntryFormProps {
  datasetName: string;
  onClose?: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ datasetName, onClose }) => {
  const { getHeaders, addDataItem } = useData();
  const [formData, setFormData] = useState<{[key: string]: string | number}>({});
  
  // Get headers for the selected dataset
  const headers = getHeaders(datasetName);
  
  // Initialize form data with empty values for each header
  useEffect(() => {
    const initialData: {[key: string]: string} = {};
    headers.forEach(header => {
      initialData[header] = '';
    });
    setFormData(initialData);
  }, [headers]);
  
  const handleInputChange = (header: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [header]: value
    }));
  };
  
  const handleSubmit = () => {
    // Convert numeric strings to numbers
    const processedData: {[key: string]: string | number} = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const numValue = Number(value);
        processedData[key] = !isNaN(numValue) && value !== '' ? numValue : value;
      } else {
        processedData[key] = value;
      }
    });
    
    // Add the data item to the dataset
    addDataItem(datasetName, processedData);
    
    // Reset form or close
    if (onClose) {
      onClose();
    } else {
      // Reset form values
      const resetData: {[key: string]: string} = {};
      headers.forEach(header => {
        resetData[header] = '';
      });
      setFormData(resetData);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Data Entry</CardTitle>
        <CardDescription>
          Add a new record to the "{datasetName}" dataset
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {headers.map(header => (
            <div key={header} className="space-y-2">
              <label htmlFor={`field-${header}`} className="text-sm font-medium">
                {header.charAt(0).toUpperCase() + header.slice(1).replace('_', ' ')}
              </label>
              <Input
                id={`field-${header}`}
                value={formData[header] || ''}
                onChange={(e) => handleInputChange(header, e.target.value)}
                placeholder={`Enter ${header}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSubmit}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataEntryForm;
