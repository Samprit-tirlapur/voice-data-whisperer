
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartBar, Table as TableIcon } from 'lucide-react';

interface ResultsDisplayProps {
  results: any[];
  sql: string;
  title?: string;
  description?: string;
}

const CHART_COLORS = ['#9b87f5', '#6E59A5', '#33C3F0', '#F97316', '#D946EF'];

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, sql, title, description }) => {
  const [activeTab, setActiveTab] = useState('table');
  
  if (!results || results.length === 0) {
    return null;
  }
  
  const headers = Object.keys(results[0]);
  
  // Determine if we have numerical data that can be visualized
  const numericalColumns = headers.filter(header => 
    typeof results[0][header] === 'number' && header !== 'id'
  );
  
  const hasNumericalData = numericalColumns.length > 0;
  
  // Determine chart type based on data
  const hasCategories = headers.some(header => 
    ['category', 'country', 'status', 'product'].includes(header)
  );
  
  const chartData = hasCategories 
    ? prepareChartDataCategories(results)
    : prepareChartDataNumerical(results, numericalColumns[0]);
  
  function prepareChartDataCategories(data: any[]) {
    // Find a category column
    const categoryColumn = headers.find(header => 
      ['category', 'country', 'status', 'product'].includes(header)
    );
    
    if (!categoryColumn || !numericalColumns[0]) return [];
    
    // Group by category and sum numerical values
    const grouped = data.reduce((acc, item) => {
      const category = item[categoryColumn];
      if (!acc[category]) {
        acc[category] = { [categoryColumn]: category, [numericalColumns[0]]: 0 };
      }
      acc[category][numericalColumns[0]] += item[numericalColumns[0]];
      return acc;
    }, {});
    
    return Object.values(grouped);
  }
  
  function prepareChartDataNumerical(data: any[], numericalColumn: string) {
    // Use the first 10 items
    return data.slice(0, 10).map(item => ({
      name: item.name || item.id,
      value: item[numericalColumn]
    }));
  }
  
  // Generate dynamic title if not provided
  const chartTitle = title || (hasCategories 
    ? `${numericalColumns[0]?.replace('_', ' ') || 'Value'} by ${headers.find(h => ['category', 'country', 'status', 'product'].includes(h)) || 'Category'}` 
    : `${numericalColumns[0]?.replace('_', ' ') || 'Data'} Distribution`
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title || 'Query Results'}</CardTitle>
        <CardDescription className="font-mono text-sm bg-muted p-2 rounded-md overflow-x-auto">
          {description || sql}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Table View
            </TabsTrigger>
            {hasNumericalData && (
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                Chart View
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="table" className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header} className="whitespace-nowrap">
                      {header.charAt(0).toUpperCase() + header.slice(1).replace('_', ' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, i) => (
                  <TableRow key={i}>
                    {headers.map((header) => (
                      <TableCell key={header} className="whitespace-nowrap">
                        {row[header]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          {hasNumericalData && (
            <TabsContent value="chart" className="w-full">
              <h3 className="text-lg font-medium mb-2">{chartTitle}</h3>
              <div className="h-[400px] w-full">
                {hasCategories ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey={headers.find(h => ['category', 'country', 'status', 'product'].includes(h)) || 'name'} 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey={numericalColumns[0]} 
                        fill="#9b87f5" 
                        name={numericalColumns[0].replace('_', ' ')}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
