// Data Analyzer Utility for Chrome Extension
class DataAnalyzer {
    constructor() {
        this.chartColors = [
            '#00ffff', '#ff00ff', '#ffff00', '#00ff00',
            '#ff8800', '#8800ff', '#ff0088', '#88ff00',
            '#0088ff', '#ff4444', '#44ff44', '#4444ff'
        ];
    }

    // Parse and analyze text data
    parseTextData(text) {
        try {
            // Try to parse as JSON first
            const jsonData = JSON.parse(text);
            return this.analyzeStructuredData(jsonData);
        } catch (e) {
            // If not JSON, try to parse as CSV or table
            return this.parseCSVData(text);
        }
    }

    // Parse CSV-like data
    parseCSVData(text) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('ข้อมูลไม่เพียงพอสำหรับการสร้างกราฟ');
        }

        // Detect delimiter
        const delimiter = this.detectDelimiter(lines[0]);
        
        // Parse headers
        const headers = lines[0].split(delimiter).map(h => h.trim());
        
        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(delimiter).map(cell => cell.trim());
            if (row.length === headers.length) {
                const rowObj = {};
                headers.forEach((header, index) => {
                    rowObj[header] = this.parseValue(row[index]);
                });
                data.push(rowObj);
            }
        }

        return {
            headers,
            data,
            suggestedChart: this.suggestChartType(headers, data)
        };
    }

    // Detect CSV delimiter
    detectDelimiter(line) {
        const delimiters = [',', '\t', ';', '|'];
        let maxCount = 0;
        let bestDelimiter = ',';

        for (const delimiter of delimiters) {
            const count = (line.match(new RegExp('\\' + delimiter, 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                bestDelimiter = delimiter;
            }
        }

        return bestDelimiter;
    }

    // Parse value (try to convert to number if possible)
    parseValue(value) {
        if (value === '' || value === null || value === undefined) {
            return null;
        }

        // Try to parse as number
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && isFinite(numValue)) {
            return numValue;
        }

        return value;
    }

    // Analyze structured data (JSON)
    analyzeStructuredData(data) {
        if (Array.isArray(data) && data.length > 0) {
            const firstItem = data[0];
            if (typeof firstItem === 'object') {
                const headers = Object.keys(firstItem);
                return {
                    headers,
                    data,
                    suggestedChart: this.suggestChartType(headers, data)
                };
            }
        }

        throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
    }

    // Suggest appropriate chart type based on data
    suggestChartType(headers, data) {
        if (!headers || !data || data.length === 0) {
            return 'table';
        }

        const numericColumns = headers.filter(header => {
            return data.some(row => typeof row[header] === 'number');
        });

        const categoricalColumns = headers.filter(header => {
            return data.some(row => typeof row[header] === 'string');
        });

        // Decision logic for chart type
        if (numericColumns.length === 0) {
            return 'table';
        }

        if (categoricalColumns.length === 1 && numericColumns.length === 1) {
            // One category, one numeric - good for bar or pie
            const uniqueCategories = new Set(data.map(row => row[categoricalColumns[0]])).size;
            return uniqueCategories <= 10 ? 'bar' : 'line';
        }

        if (numericColumns.length >= 2) {
            // Multiple numeric columns - good for line chart
            return 'line';
        }

        if (categoricalColumns.length >= 2) {
            // Multiple categories - table might be better
            return 'table';
        }

        return 'bar'; // Default
    }

    // Convert data to Chart.js format
    convertToChartData(analyzedData, chartType = null) {
        const { headers, data, suggestedChart } = analyzedData;
        const finalChartType = chartType || suggestedChart;

        switch (finalChartType) {
            case 'bar':
            case 'line':
                return this.createLineBarChartData(headers, data, finalChartType);
            
            case 'pie':
            case 'doughnut':
                return this.createPieChartData(headers, data, finalChartType);
            
            case 'scatter':
                return this.createScatterChartData(headers, data);
            
            case 'table':
                return this.createTableData(headers, data);
            
            default:
                return this.createTableData(headers, data);
        }
    }

    // Create line/bar chart data
    createLineBarChartData(headers, data, chartType) {
        const categoricalColumn = headers.find(header => 
            data.some(row => typeof row[header] === 'string')
        );
        
        const numericColumns = headers.filter(header => 
            data.some(row => typeof row[header] === 'number')
        );

        if (!categoricalColumn || numericColumns.length === 0) {
            throw new Error('ข้อมูลไม่เหมาะสำหรับกราฟประเภทนี้');
        }

        const labels = data.map(row => row[categoricalColumn]);
        const datasets = numericColumns.map((column, index) => ({
            label: column,
            data: data.map(row => row[column] || 0),
            backgroundColor: chartType === 'line' ? 'transparent' : this.chartColors[index % this.chartColors.length],
            borderColor: this.chartColors[index % this.chartColors.length],
            borderWidth: 2,
            fill: false
        }));

        return {
            type: chartType,
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#cccccc' },
                        grid: { color: '#333333' }
                    },
                    y: {
                        ticks: { color: '#cccccc' },
                        grid: { color: '#333333' }
                    }
                }
            }
        };
    }

    // Create pie chart data
    createPieChartData(headers, data, chartType) {
        const categoricalColumn = headers.find(header => 
            data.some(row => typeof row[header] === 'string')
        );
        
        const numericColumn = headers.find(header => 
            data.some(row => typeof row[header] === 'number')
        );

        if (!categoricalColumn || !numericColumn) {
            throw new Error('ข้อมูลไม่เหมาะสำหรับกราหวงกลม');
        }

        const labels = data.map(row => row[categoricalColumn]);
        const values = data.map(row => row[numericColumn] || 0);

        return {
            type: chartType,
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: this.chartColors.slice(0, labels.length),
                    borderColor: '#333333',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                }
            }
        };
    }

    // Create scatter chart data
    createScatterChartData(headers, data) {
        const numericColumns = headers.filter(header => 
            data.some(row => typeof row[header] === 'number')
        );

        if (numericColumns.length < 2) {
            throw new Error('ต้องมีข้อมูลตัวเลขอย่างน้อย 2 คอลัมน์สำหรับกราฟกระจาย');
        }

        const xColumn = numericColumns[0];
        const yColumn = numericColumns[1];

        const scatterData = data.map(row => ({
            x: row[xColumn] || 0,
            y: row[yColumn] || 0
        }));

        return {
            type: 'scatter',
            data: {
                datasets: [{
                    label: `${xColumn} vs ${yColumn}`,
                    data: scatterData,
                    backgroundColor: this.chartColors[0],
                    borderColor: this.chartColors[0]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xColumn,
                            color: '#cccccc'
                        },
                        ticks: { color: '#cccccc' },
                        grid: { color: '#333333' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yColumn,
                            color: '#cccccc'
                        },
                        ticks: { color: '#cccccc' },
                        grid: { color: '#333333' }
                    }
                }
            }
        };
    }

    // Create table data
    createTableData(headers, data) {
        return {
            type: 'table',
            headers,
            data,
            options: {
                responsive: true,
                striped: true,
                bordered: true
            }
        };
    }

    // Generate summary statistics
    generateSummary(data, numericColumns) {
        const summary = {};

        numericColumns.forEach(column => {
            const values = data.map(row => row[column]).filter(val => typeof val === 'number');
            
            if (values.length > 0) {
                summary[column] = {
                    count: values.length,
                    sum: values.reduce((a, b) => a + b, 0),
                    mean: values.reduce((a, b) => a + b, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    median: this.calculateMedian(values)
                };
            }
        });

        return summary;
    }

    // Calculate median
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    // Export data as CSV
    exportAsCSV(headers, data) {
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    // Export data as JSON
    exportAsJSON(headers, data) {
        return JSON.stringify(data, null, 2);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataAnalyzer;
} else {
    window.DataAnalyzer = DataAnalyzer;
}

