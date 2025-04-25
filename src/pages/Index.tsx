import React, { useState } from 'react';
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
import { Database, Upload, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    if (!history.includes(text)) {
      setHistory(prev => [text, ...prev].slice(0, 10));
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
          <div className="md:col-span-4 space-y-6">
            <VoiceRecorder onTranscription={handleTranscription} />
            
            {datasets.length === 0 && (
              <Card className="bg-card border-2 border-dashed">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">No Datasets Found</h2>
                  <p className="text-muted-foreground">Import or create a dataset to start querying data.</p>
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
              <Card className="bg-card border-2 border-dashed">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Select a Dataset</h2>
                  <p className="text-muted-foreground">Choose a dataset to start querying.</p>
                  <Link to="/database">
                    <Button className="w-full flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Select Dataset
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
              <>
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold">Active Dataset: <span className="text-primary">{activeDataset}</span></h2>
                        <p className="text-muted-foreground mt-1">Try these example queries:</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Alert>
                        <AlertDescription>
                          "Show me the top 5 customers by revenue"
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <AlertDescription>
                          "List all orders with completed status"
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    {datasets.length >= 2 && (
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">Join Operations Available</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Alert>
                            <AlertDescription>
                              "Join {datasets[0].name} and {datasets[1].name}"
                            </AlertDescription>
                          </Alert>
                          <Alert>
                            <AlertDescription>
                              "Left join {datasets[0].name} with {datasets[1].name}"
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {activeDataset && query && (
                  <QueryProcessor query={query} onResults={handleResults} />
                )}
                
                {activeDataset && results.length > 0 && (
                  <ResultsDisplay results={results} sql={sql} title={title} />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
