
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';

interface DataItem {
  [key: string]: string | number;
}

interface DataContextType {
  datasets: { name: string; data: DataItem[] }[];
  activeDataset: string | null;
  setActiveDataset: (name: string | null) => void;
  addDataset: (name: string, data: DataItem[]) => void;
  removeDataset: (name: string) => void;
  addDataItem: (datasetName: string, item: DataItem) => void;
  getActiveData: () => DataItem[];
  getHeaders: (datasetName?: string) => string[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<{ name: string; data: DataItem[] }[]>([]);
  const [activeDataset, setActiveDataset] = useState<string | null>(null);

  // Load user data from localStorage on login
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`datasets-${user.id}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setDatasets(parsedData);
        if (parsedData.length > 0) {
          setActiveDataset(parsedData[0].name);
        }
      }
    } else {
      // Clear data on logout
      setDatasets([]);
      setActiveDataset(null);
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user && datasets.length > 0) {
      localStorage.setItem(`datasets-${user.id}`, JSON.stringify(datasets));
    }
  }, [datasets, user]);

  const addDataset = (name: string, data: DataItem[]) => {
    if (!user) return;
    
    const existingIndex = datasets.findIndex(ds => ds.name === name);
    
    if (existingIndex >= 0) {
      // Update existing dataset
      const newDatasets = [...datasets];
      newDatasets[existingIndex] = { name, data };
      setDatasets(newDatasets);
      toast.success(`Dataset '${name}' updated`);
    } else {
      // Add new dataset
      setDatasets([...datasets, { name, data }]);
      toast.success(`Dataset '${name}' added`);
    }
    
    setActiveDataset(name);
  };

  const removeDataset = (name: string) => {
    if (!user) return;
    
    setDatasets(datasets.filter(ds => ds.name !== name));
    
    if (activeDataset === name) {
      setActiveDataset(datasets.length > 1 ? datasets.find(ds => ds.name !== name)?.name || null : null);
    }
    
    toast.success(`Dataset '${name}' removed`);
  };

  const addDataItem = (datasetName: string, item: DataItem) => {
    if (!user) return;
    
    const datasetIndex = datasets.findIndex(ds => ds.name === datasetName);
    
    if (datasetIndex >= 0) {
      const newDatasets = [...datasets];
      newDatasets[datasetIndex].data.push(item);
      setDatasets(newDatasets);
      toast.success('Data entry added');
    }
  };

  const getActiveData = () => {
    if (!activeDataset) return [];
    const dataset = datasets.find(ds => ds.name === activeDataset);
    return dataset ? dataset.data : [];
  };

  const getHeaders = (datasetName?: string) => {
    const targetDataset = datasetName 
      ? datasets.find(ds => ds.name === datasetName) 
      : datasets.find(ds => ds.name === activeDataset);
    
    if (!targetDataset || targetDataset.data.length === 0) return [];
    
    return Object.keys(targetDataset.data[0]);
  };

  return (
    <DataContext.Provider 
      value={{ 
        datasets, 
        activeDataset, 
        setActiveDataset, 
        addDataset, 
        removeDataset, 
        addDataItem, 
        getActiveData,
        getHeaders 
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
