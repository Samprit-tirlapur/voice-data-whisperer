
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Header from '@/components/layout/Header';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import QueryProcessor from '@/components/data/QueryProcessor';
import ResultsDisplay from '@/components/data/ResultsDisplay';
import QueryHistory from '@/components/layout/QueryHistory';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [sql, setSql] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  
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
  
  const handleResults = (data: any[], sqlQuery: string) => {
    setResults(data);
    setSql(sqlQuery);
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
              {history.length > 0 && (
                <QueryHistory 
                  history={history} 
                  onSelectQuery={handleSelectFromHistory} 
                />
              )}
            </div>
          </div>
          
          <div className="md:col-span-8 space-y-6">
            <Card className="bg-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
                <p className="mb-3">Here are some example queries you can try:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Show me the top 5 customers by revenue</li>
                  <li>List all orders with completed status</li>
                  <li>What products do we have in the Electronics category?</li>
                  <li>Show me customers from the USA</li>
                  <li>How many orders do we have?</li>
                </ul>
              </CardContent>
            </Card>
            
            {query && <QueryProcessor query={query} onResults={handleResults} />}
            
            {results.length > 0 && (
              <ResultsDisplay results={results} sql={sql} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
