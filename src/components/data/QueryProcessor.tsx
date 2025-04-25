
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { useData } from '@/context/DataContext';

interface QueryProcessorProps {
  query: string;
  onResults: (results: any[], sql: string, title?: string) => void;
}

const QueryProcessor: React.FC<QueryProcessorProps> = ({ query, onResults }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { activeDataset, getActiveData } = useData();
  
  useEffect(() => {
    if (query) {
      processQuery(query);
    }
  }, [query]);
  
  const generateSQL = (query: string): string => {
    // This is a simplified mock implementation
    const queryLower = query.toLowerCase();
    let sql = '';
    
    // Check for select pattern and extract info
    if (queryLower.includes('show me') || queryLower.includes('list') || queryLower.includes('get')) {
      let columns = '*';
      
      // Check for any conditions
      let whereClause = '';
      
      // These are just mock conditions - in real app, you'd use NLP
      // to extract conditions from the query
      if (queryLower.includes('completed')) {
        whereClause = " WHERE status = 'completed'";
      } else if (queryLower.includes('usa')) {
        whereClause = " WHERE country = 'USA'";
      } else if (queryLower.includes('electronics')) {
        whereClause = " WHERE category = 'Electronics'";
      }
      
      // Check for ordering
      let orderClause = '';
      if (queryLower.includes('highest') || queryLower.includes('top')) {
        if (queryLower.includes('revenue')) {
          orderClause = ' ORDER BY revenue DESC';
        } else if (queryLower.includes('price')) {
          orderClause = ' ORDER BY price DESC';
        }
      } else if (queryLower.includes('lowest') || queryLower.includes('bottom')) {
        if (queryLower.includes('revenue')) {
          orderClause = ' ORDER BY revenue ASC';
        } else if (queryLower.includes('price')) {
          orderClause = ' ORDER BY price ASC';
        }
      }
      
      // Check for limits
      let limitClause = '';
      if (queryLower.includes('top 5') || queryLower.includes('first 5')) {
        limitClause = ' LIMIT 5';
      } else if (queryLower.includes('top 10') || queryLower.includes('first 10')) {
        limitClause = ' LIMIT 10';
      } else {
        // Default limit to avoid overwhelming results
        limitClause = ' LIMIT 20';
      }
      
      sql = `SELECT ${columns} FROM ${activeDataset}${whereClause}${orderClause}${limitClause};`;
    } else if (queryLower.includes('count') || queryLower.includes('how many')) {
      let whereClause = '';
      
      if (queryLower.includes('completed')) {
        whereClause = " WHERE status = 'completed'";
      } else if (queryLower.includes('usa')) {
        whereClause = " WHERE country = 'USA'";
      }
      
      sql = `SELECT COUNT(*) as count FROM ${activeDataset}${whereClause};`;
    }
    
    // Default query if we couldn't parse the natural language
    if (!sql && activeDataset) {
      sql = `SELECT * FROM ${activeDataset} LIMIT 10;`;
    }
    
    return sql;
  };

  const executeQuery = (sql: string, data: any[]): any[] => {
    console.log('Executing SQL:', sql);
    
    // Very simple SQL parser for demonstration purposes
    const matches = sql.match(/SELECT (.*?) FROM (.*?)(?:;|\s+WHERE\s+(.*?)(?:;|\s+ORDER BY\s+(.*?)(?:;|\s+LIMIT\s+(\d+))?)?)?/i);
    
    if (!matches) {
      return [];
    }
    
    const columns = matches[1].trim();
    const whereClause = matches[3] ? matches[3].trim() : '';
    
    // Extract ORDER BY if it exists
    let orderBy = '';
    let orderDir = 'ASC';
    if (sql.includes('ORDER BY')) {
      const orderMatches = sql.match(/ORDER BY\s+(.*?)(?:\s+|;|$)/i);
      if (orderMatches && orderMatches[1]) {
        const orderParts = orderMatches[1].trim().split(/\s+/);
        orderBy = orderParts[0];
        if (orderParts.length > 1) {
          orderDir = orderParts[1].toUpperCase();
        }
      }
    }
    
    // Extract LIMIT if it exists
    let limit = 20; // Default limit
    if (sql.includes('LIMIT')) {
      const limitMatches = sql.match(/LIMIT\s+(\d+)/i);
      if (limitMatches && limitMatches[1]) {
        limit = parseInt(limitMatches[1]);
      }
    }
    
    // Apply WHERE clause filtering
    let filteredData = [...data];
    if (whereClause) {
      const whereMatches = whereClause.match(/(.*?)\s*=\s*'(.*?)'/i);
      if (whereMatches) {
        const field = whereMatches[1].trim();
        const value = whereMatches[2].trim();
        filteredData = data.filter(item => String(item[field]) === value);
      }
    }
    
    // Apply ORDER BY
    if (orderBy) {
      filteredData.sort((a, b) => {
        if (orderDir === 'ASC') {
          return a[orderBy] > b[orderBy] ? 1 : -1;
        } else {
          return a[orderBy] < b[orderBy] ? 1 : -1;
        }
      });
    }
    
    // Apply column selection
    if (columns !== '*') {
      const selectedColumns = columns.split(',').map(c => c.trim());
      filteredData = filteredData.map(item => {
        const newItem: any = {};
        selectedColumns.forEach(col => {
          newItem[col] = item[col];
        });
        return newItem;
      });
    }
    
    // Apply LIMIT
    filteredData = filteredData.slice(0, limit);
    
    return filteredData;
  };

  const processQuery = async (queryText: string) => {
    if (!activeDataset) {
      toast.error('Please select a dataset first');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulating processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the data from the current dataset
      const data = getActiveData();
      
      if (data.length === 0) {
        toast.error('The selected dataset is empty');
        setIsProcessing(false);
        return;
      }
      
      // Generate SQL from natural language
      const sql = generateSQL(queryText);
      
      if (!sql) {
        toast.error('Could not generate SQL from your query');
        setIsProcessing(false);
        return;
      }
      
      // Execute the query
      const results = executeQuery(sql, data);
      
      // Generate a title for the visualization
      let title = '';
      const queryLower = queryText.toLowerCase();
      
      if (queryLower.includes('top') || queryLower.includes('highest')) {
        if (queryLower.includes('revenue')) {
          title = 'Top Customers by Revenue';
        } else if (queryLower.includes('sales')) {
          title = 'Top Products by Sales';
        }
      } else if (queryLower.includes('count') || queryLower.includes('how many')) {
        title = 'Count Results';
      }
      
      // Send results back to parent
      onResults(results, sql, title);
      
      toast.success('Query processed successfully');
    } catch (error) {
      console.error('Error processing query:', error);
      toast.error('Failed to process query. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-4">
      {isProcessing && (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-t-brand-purple rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-muted-foreground">Processing query...</p>
        </div>
      )}
    </div>
  );
};

export default QueryProcessor;
