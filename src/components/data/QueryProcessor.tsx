
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { useData } from '@/context/DataContext';

interface QueryProcessorProps {
  query: string;
  onResults: (results: any[], sql: string, title?: string) => void;
}

const QueryProcessor: React.FC<QueryProcessorProps> = ({ query, onResults }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { activeDataset, getActiveData, datasets } = useData();
  
  useEffect(() => {
    if (query) {
      processQuery(query);
    }
  }, [query]);
  
  const generateSQL = (query: string): string => {
    // This is a simplified mock implementation
    const queryLower = query.toLowerCase();
    let sql = '';
    
    // Check for join pattern
    if (queryLower.includes('join') || queryLower.includes('combine')) {
      // Extract dataset names
      const datasetNames = extractDatasetNames(queryLower);
      
      if (datasetNames.length >= 2) {
        const joinType = queryLower.includes('inner join') ? 'INNER JOIN' : 
                      queryLower.includes('left join') ? 'LEFT JOIN' : 
                      'JOIN';
        
        // Extract join conditions
        let joinCondition = '';
        const onMatch = queryLower.match(/on\s+(.*?)(?:\s+where|\s+order|\s+limit|$)/i);
        if (onMatch && onMatch[1]) {
          joinCondition = ` ON ${onMatch[1]}`;
        } else {
          // Default join condition based on common field names
          joinCondition = ' ON common_field_placeholder';
        }
        
        sql = `SELECT * FROM ${datasetNames[0]} ${joinType} ${datasetNames[1]}${joinCondition}`;
      }
    } 
    // Fallback to regular select if no join detected
    else if (queryLower.includes('show me') || queryLower.includes('list') || queryLower.includes('get')) {
      let columns = '*';
      
      // Check for any conditions
      let whereClause = '';
      
      // These are just mock conditions - in real app, you'd use NLP
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

  const extractDatasetNames = (query: string): string[] => {
    const datasetNames: string[] = [];
    
    // Get all available dataset names
    const availableDatasets = datasets.map(ds => ds.name.toLowerCase());
    
    // Look for dataset names in the query
    availableDatasets.forEach(name => {
      if (query.includes(name)) {
        datasetNames.push(name);
      }
    });
    
    // If we couldn't find explicit dataset names and there is an active dataset,
    // use the active dataset as the first dataset
    if (datasetNames.length === 0 && activeDataset) {
      datasetNames.push(activeDataset.toLowerCase());
    }
    
    return datasetNames;
  };

  const executeQuery = (sql: string, data: any[]): any[] => {
    console.log('Executing SQL:', sql);
    
    // Check if it's a join query
    if (sql.toLowerCase().includes('join')) {
      return executeJoinQuery(sql);
    }
    
    // Very simple SQL parser for regular queries
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
  
  const executeJoinQuery = (sql: string): any[] => {
    console.log('Executing join query:', sql);
    
    // Parse the join query to extract datasets and join condition
    const joinRegex = /SELECT\s+(.*?)\s+FROM\s+(.*?)\s+((?:INNER|LEFT|RIGHT|OUTER)?\s*JOIN)\s+(.*?)(?:\s+ON\s+(.*?))?(?:\s+WHERE\s+(.*?))?(?:\s+ORDER BY\s+(.*?))?(?:\s+LIMIT\s+(\d+))?;?$/i;
    const matches = sql.match(joinRegex);
    
    if (!matches) {
      console.error('Could not parse join query:', sql);
      return [];
    }
    
    const columns = matches[1].trim();
    const leftTable = matches[2].trim();
    const joinType = matches[3].trim();
    const rightTable = matches[4].trim();
    const onCondition = matches[5]?.trim() || 'common_field_placeholder';
    
    console.log('Join parameters:', { leftTable, joinType, rightTable, onCondition });
    
    // Get the data for both tables
    const leftTableData = findDatasetByName(leftTable) || [];
    const rightTableData = findDatasetByName(rightTable) || [];
    
    if (leftTableData.length === 0 || rightTableData.length === 0) {
      console.error('One or both datasets not found:', { leftTable, rightTable });
      return [];
    }
    
    // If the join condition is our placeholder, try to find common field names
    let joinField = '';
    if (onCondition === 'common_field_placeholder') {
      const leftFields = leftTableData.length > 0 ? Object.keys(leftTableData[0]) : [];
      const rightFields = rightTableData.length > 0 ? Object.keys(rightTableData[0]) : [];
      
      // Find common field names between the two datasets
      joinField = leftFields.find(field => rightFields.includes(field)) || '';
      
      if (!joinField) {
        console.error('No common field found for join condition');
        return [];
      }
      
      console.log('Automatically determined join field:', joinField);
    } else {
      // Parse the ON condition to extract the field names
      // Example: "customer.id = orders.customer_id"
      const onMatch = onCondition.match(/(.*?)\.(\w+)\s*=\s*(.*?)\.(\w+)/i);
      if (onMatch) {
        const leftTableField = onMatch[2];
        const rightTableField = onMatch[4];
        
        joinField = leftTableField; // We're assuming the fields match or have compatible values
      } else {
        // If we can't parse the condition, just use it as is
        joinField = onCondition;
      }
    }
    
    // Perform the join operation
    let joinedData: any[] = [];
    
    // Inner join
    if (joinType.toUpperCase().includes('INNER')) {
      leftTableData.forEach(leftRow => {
        rightTableData.forEach(rightRow => {
          if (leftRow[joinField] === rightRow[joinField]) {
            joinedData.push({
              ...leftRow,
              ...rightRow,
              _join_left_source: leftTable,
              _join_right_source: rightTable
            });
          }
        });
      });
    }
    // Left join (including unmatched rows from the left table)
    else if (joinType.toUpperCase().includes('LEFT')) {
      leftTableData.forEach(leftRow => {
        let hasMatch = false;
        
        rightTableData.forEach(rightRow => {
          if (leftRow[joinField] === rightRow[joinField]) {
            hasMatch = true;
            joinedData.push({
              ...leftRow,
              ...rightRow,
              _join_left_source: leftTable,
              _join_right_source: rightTable
            });
          }
        });
        
        if (!hasMatch) {
          joinedData.push({
            ...leftRow,
            _join_left_source: leftTable,
            _join_right_source: null
          });
        }
      });
    }
    // Default to a basic join (like INNER JOIN)
    else {
      leftTableData.forEach(leftRow => {
        rightTableData.forEach(rightRow => {
          if (leftRow[joinField] === rightRow[joinField]) {
            joinedData.push({
              ...leftRow,
              ...rightRow,
              _join_left_source: leftTable,
              _join_right_source: rightTable
            });
          }
        });
      });
    }
    
    // Apply limit if specified
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch && limitMatch[1]) {
      const limit = parseInt(limitMatch[1]);
      joinedData = joinedData.slice(0, limit);
    } else {
      // Default limit
      joinedData = joinedData.slice(0, 20);
    }
    
    console.log(`Join completed with ${joinedData.length} results`);
    
    return joinedData;
  };
  
  const findDatasetByName = (name: string): any[] => {
    const dataset = datasets.find(ds => ds.name.toLowerCase() === name.toLowerCase());
    return dataset ? dataset.data : [];
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
      
      if (sql.toLowerCase().includes('join')) {
        title = 'Joined Data Results';
      } else if (queryLower.includes('top') || queryLower.includes('highest')) {
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
