
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

interface QueryProcessorProps {
  query: string;
  onResults: (results: any[], sql: string) => void;
}

interface Table {
  name: string;
  columns: string[];
}

// Mock database schema
const mockSchema: Table[] = [
  {
    name: 'customers',
    columns: ['id', 'name', 'email', 'signup_date', 'country', 'revenue']
  },
  {
    name: 'orders',
    columns: ['id', 'customer_id', 'product', 'amount', 'date', 'status']
  },
  {
    name: 'products',
    columns: ['id', 'name', 'category', 'price', 'stock']
  }
];

// Mock data generator
const generateMockData = (table: string, count: number) => {
  const data: any[] = [];
  
  if (table === 'customers') {
    const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'];
    for (let i = 0; i < count; i++) {
      data.push({
        id: i + 1,
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        signup_date: new Date(2020 + Math.floor(i/10), i % 12, (i % 28) + 1).toISOString().split('T')[0],
        country: countries[i % countries.length],
        revenue: Math.floor(Math.random() * 10000)
      });
    }
  } else if (table === 'orders') {
    const statuses = ['completed', 'pending', 'cancelled', 'shipped'];
    const products = ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse'];
    
    for (let i = 0; i < count; i++) {
      data.push({
        id: i + 1,
        customer_id: Math.floor(Math.random() * 20) + 1,
        product: products[i % products.length],
        amount: Math.floor(Math.random() * 1000) + 50,
        date: new Date(2023, i % 12, (i % 28) + 1).toISOString().split('T')[0],
        status: statuses[i % statuses.length]
      });
    }
  } else if (table === 'products') {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
    
    for (let i = 0; i < count; i++) {
      data.push({
        id: i + 1,
        name: `Product ${i + 1}`,
        category: categories[i % categories.length],
        price: Math.floor(Math.random() * 500) + 10,
        stock: Math.floor(Math.random() * 100)
      });
    }
  }
  
  return data;
};

// Function to convert natural language to SQL
const generateSQL = (query: string): string => {
  // This is a simplified mock implementation
  // In a real application, you would use a more sophisticated NLP approach
  // or connect to a language model API
  
  const queryLower = query.toLowerCase();
  let sql = '';
  
  // Check for select pattern and extract info
  if (queryLower.includes('show me') || queryLower.includes('list') || queryLower.includes('get')) {
    // Determine the table
    let tableName = '';
    if (queryLower.includes('customer')) {
      tableName = 'customers';
    } else if (queryLower.includes('order')) {
      tableName = 'orders';
    } else if (queryLower.includes('product')) {
      tableName = 'products';
    } else {
      // Default to customers if no table is specified
      tableName = 'customers';
    }
    
    // Determine if we need specific columns
    let columns = '*';
    if (queryLower.includes('revenue') && tableName === 'customers') {
      columns = 'id, name, revenue';
    } else if (queryLower.includes('status') && tableName === 'orders') {
      columns = 'id, product, status, date';
    }
    
    // Check for any conditions
    let whereClause = '';
    if (queryLower.includes('completed') && tableName === 'orders') {
      whereClause = ' WHERE status = \'completed\'';
    } else if (queryLower.includes('usa') && tableName === 'customers') {
      whereClause = ' WHERE country = \'USA\'';
    } else if (queryLower.includes('electronics') && tableName === 'products') {
      whereClause = ' WHERE category = \'Electronics\'';
    }
    
    // Check for ordering
    let orderClause = '';
    if (queryLower.includes('highest') || queryLower.includes('top')) {
      if (tableName === 'customers' && queryLower.includes('revenue')) {
        orderClause = ' ORDER BY revenue DESC';
      } else if (tableName === 'products' && queryLower.includes('price')) {
        orderClause = ' ORDER BY price DESC';
      }
    } else if (queryLower.includes('lowest') || queryLower.includes('bottom')) {
      if (tableName === 'customers' && queryLower.includes('revenue')) {
        orderClause = ' ORDER BY revenue ASC';
      } else if (tableName === 'products' && queryLower.includes('price')) {
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
    
    sql = `SELECT ${columns} FROM ${tableName}${whereClause}${orderClause}${limitClause};`;
  } else if (queryLower.includes('count') || queryLower.includes('how many')) {
    // Handle count queries
    let tableName = '';
    if (queryLower.includes('customer')) {
      tableName = 'customers';
    } else if (queryLower.includes('order')) {
      tableName = 'orders';
    } else if (queryLower.includes('product')) {
      tableName = 'products';
    }
    
    let whereClause = '';
    if (queryLower.includes('completed') && tableName === 'orders') {
      whereClause = ' WHERE status = \'completed\'';
    } else if (queryLower.includes('usa') && tableName === 'customers') {
      whereClause = ' WHERE country = \'USA\'';
    }
    
    sql = `SELECT COUNT(*) as count FROM ${tableName}${whereClause};`;
  }
  
  // Default query if we couldn't parse the natural language
  if (!sql) {
    sql = 'SELECT * FROM customers LIMIT 10;';
  }
  
  return sql;
};

// Execute the SQL query against our mock data
const executeQuery = (sql: string): any[] => {
  console.log('Executing SQL:', sql);
  
  // Very simple SQL parser for demonstration purposes
  const matches = sql.match(/SELECT (.*?) FROM (.*?)(?:;|\s+WHERE\s+(.*?)(?:;|\s+ORDER BY\s+(.*?)(?:;|\s+LIMIT\s+(\d+))?)?)?/i);
  
  if (!matches) {
    return [];
  }
  
  const columns = matches[1].trim();
  const tableName = matches[2].trim();
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
  
  // Generate mock data
  let data = generateMockData(tableName, 50);
  
  // Apply WHERE clause filtering
  if (whereClause) {
    const whereMatches = whereClause.match(/(.*?)\s*=\s*'(.*?)'/i);
    if (whereMatches) {
      const field = whereMatches[1].trim();
      const value = whereMatches[2].trim();
      data = data.filter(item => item[field] === value);
    }
  }
  
  // Apply ORDER BY
  if (orderBy) {
    data.sort((a, b) => {
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
    data = data.map(item => {
      const newItem: any = {};
      selectedColumns.forEach(col => {
        newItem[col] = item[col];
      });
      return newItem;
    });
  }
  
  // Apply LIMIT
  data = data.slice(0, limit);
  
  return data;
};

const QueryProcessor: React.FC<QueryProcessorProps> = ({ query, onResults }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (query) {
      processQuery(query);
    }
  }, [query]);
  
  const processQuery = async (queryText: string) => {
    setIsProcessing(true);
    
    try {
      // Simulating processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate SQL from natural language
      const sql = generateSQL(queryText);
      
      // Execute the query
      const results = executeQuery(sql);
      
      // Send results back to parent
      onResults(results, sql);
      
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
