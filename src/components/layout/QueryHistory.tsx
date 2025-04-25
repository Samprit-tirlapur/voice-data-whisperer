
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QueryHistoryProps {
  history: string[];
  onSelectQuery: (query: string) => void;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ history, onSelectQuery }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="w-full rounded-lg border border-border p-4">
      <h3 className="font-semibold mb-3">Recent Queries</h3>
      <ScrollArea className="h-[200px] w-full">
        <div className="space-y-2">
          {history.map((query, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left h-auto py-2 text-sm"
              onClick={() => onSelectQuery(query)}
            >
              {query}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default QueryHistory;
