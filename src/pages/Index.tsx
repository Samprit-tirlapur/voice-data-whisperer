
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Header from '@/components/layout/Header';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import QueryProcessor from '@/components/data/QueryProcessor';
import ResultsDisplay from '@/components/data/ResultsDisplay';
import QueryHistory from '@/components/layout/QueryHistory';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Database, Upload } from 'lucide-react';

const Index = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [sql, setSql] = useState('');
  const [title, setTitle] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { datasets, activeDataset } = useData();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const handleTranscription = (text: string) => {
    setQuery(text);
    // Add to history if not already present
    if (!history.includes(text)) {
      setHistory(prev => [text, ...prev].slice(0, 10)); // Keep only 10 most recent
    }
  };
  
  const handleResults = (data: any[], sqlQuery: string, chartTitle?: string) => {
    setResults(data);
    setSql(sqlQuery);
    setTitle(chartTitle || '');
  };
  
  const handleSelectFromHistory = (text: string) => {
    setQuery(text);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" />
      <Header toggleTheme={toggleTheme} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <div className="space-y-6">
              <VoiceRecorder onTranscription={handleTranscription} />
              
              {datasets.length === 0 && (
                <Card className="bg-card">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">No Datasets Found</h2>
                    <p>You need to import or create a dataset before you can start querying data.</p>
                    <Link to="/database">
                      <Button className="w-full flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Go to Database Management
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
              
              {datasets.length > 0 && !activeDataset && (
                <Card className="bg-card">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Select a Dataset</h2>
                    <p>Please select a dataset to start querying.</p>
                    <Link to="/database">
                      <Button className="w-full flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Go to Database Management
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
              
              {history.length > 0 && (
                <QueryHistory 
                  history={history} 
                  onSelectQuery={handleSelectFromHistory} 
                />
              )}
            </div>
          </div>
          
          <div className="md:col-span-8 space-y-6">
            {(!datasets.length || !activeDataset) ? (
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
                  <p className="mb-3">To use the Voice Data Whisperer, you need to:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Go to the Database section and import a CSV file or create a dataset</li>
                    <li>Select the dataset you want to query</li>
                    <li>Return to this page and use voice commands to query your data</li>
                  </ol>
                  <div className="mt-4">
                    <Link to="/database">
                      <Button className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Import Data Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
                  <p className="mb-3">Currently querying dataset: <strong>{activeDataset}</strong></p>
                  <p className="mb-3">Here are some example queries you can try:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Show me the top 5 customers by revenue</li>
                    <li>List all orders with completed status</li>
                    <li>What products do we have in the Electronics category?</li>
                    <li>Show me customers from the USA</li>
                    <li>How many orders do we have?</li>
                  </ul>
                  
                  {datasets.length >= 2 && (
                    <>
                      <h3 className="text-lg font-semibold mt-4 mb-2">Join Operations</h3>
                      <p className="mb-3">You can also join datasets with these queries:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Join {datasets[0].name} and {datasets[1].name}</li>
                        <li>Show me inner join between {datasets[0].name} and {datasets[1].name}</li>
                        <li>Left join {datasets[0].name} with {datasets[1].name}</li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: Joins will automatically find common fields between datasets
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
            
            {activeDataset && query && (
              <QueryProcessor query={query} onResults={handleResults} />
            )}
            
            {activeDataset && results.length > 0 && (
              <ResultsDisplay results={results} sql={sql} title={title} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
