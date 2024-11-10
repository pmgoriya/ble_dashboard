// src/utils/dataFetcher.js
import { ddbDocClient } from '../aws-config';
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

let discoveredColumns = [];

// Helper function to perform a complete scan of the DynamoDB table
async function scanAllItems(params) {
  let items = [];
  let lastEvaluatedKey = null;

  do {
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    const command = new ScanCommand(params);
    const response = await ddbDocClient.send(command);

    items = items.concat(response.Items);
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}

export const fetchHubGoatMapping = async () => {
  const params = {
    TableName: 'BLETesting',
    ProjectionExpression: 'hubId, deviceName'
  };

  try {
    console.log('Fetching Hub-Goat mapping');
    const Items = await scanAllItems(params);
    console.log('Received items:', Items.length);

    const mapping = {};
    Items.forEach(item => {
      const hubId = item.hubId && item.hubId.S ? item.hubId.S : 'unknown';
      const goatId = item.deviceName && item.deviceName.S ? item.deviceName.S : 'unknown';
      if (hubId !== 'unknown' && goatId !== 'unknown') {
        if (!mapping[hubId]) {
          mapping[hubId] = new Set();
        }
        mapping[hubId].add(goatId);
      }
    });

    // Convert Sets to Arrays
    for (const hubId in mapping) {
      mapping[hubId] = Array.from(mapping[hubId]);
    }

    console.log('Hub-Goat mapping created:', Object.keys(mapping).length, 'hubs');
    return mapping;
  } catch (error) {
    console.error('Error fetching Hub-Goat mapping from DynamoDB:', error);
    throw new Error(`Failed to fetch Hub-Goat mapping: ${error.message}`);
  }
};

// Function to fetch data based on goatId, pagination, sorting, etc.
export const fetchData = async (hubId, goatId, page = 1, perPage = 10, sortField = 'timestamp', sortDirection = 'desc') => {
  console.log('Fetching data with params:', { hubId, goatId, page, perPage, sortField, sortDirection });
  let params = {
    TableName: 'BLETesting',
  };

  let filterExpressions = [];
  let expressionAttributeNames = {};
  let expressionAttributeValues = {};

  if (hubId !== "All") {
    filterExpressions.push('#hubId = :hubId');
    expressionAttributeNames['#hubId'] = 'hubId';
    expressionAttributeValues[':hubId'] = { S: hubId };
  }

  if (goatId !== "All") {
    filterExpressions.push('#deviceName = :goatId');
    expressionAttributeNames['#deviceName'] = 'deviceName';
    expressionAttributeValues[':goatId'] = { S: goatId };
  }

  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(' AND ');
    params.ExpressionAttributeNames = expressionAttributeNames;
    params.ExpressionAttributeValues = expressionAttributeValues;
  }

  try {
    console.log('Scanning DynamoDB with params:', params);
    const Items = await scanAllItems(params);
    console.log('Received Items from DynamoDB:', Items.length);

    Items.forEach(item => {
      const unmarshalledItem = unmarshall(item);
      Object.keys(unmarshalledItem).forEach(key => {
        if (!discoveredColumns.includes(key)) {
          discoveredColumns.push(key);
          console.log('Discovered new column:', key);
        }
      });
    });


    const data = Items.map(item => {
      const unmarshalledItem = unmarshall(item);
      const baseData = {
        // Keep existing hardcoded mappings
        timestamp: unmarshalledItem.timestamp || 'N/A',
        goatId: unmarshalledItem.deviceName || 'N/A',
        tagId: unmarshalledItem.tagId || 'N/A',
        hubId: unmarshalledItem.hubId || 'N/A',
        temperature: unmarshalledItem.temperature || 'N/A',
        ambientTemperature: unmarshalledItem.ambientTemperature || 'N/A',
        ambientHumidity: unmarshalledItem.ambientHumidity || 'N/A',
        battery: unmarshalledItem.battery || 'N/A',
        proximity: unmarshalledItem.proximity !== undefined ? unmarshalledItem.proximity : 'N/A',
        rssi: unmarshalledItem.rssi || 'N/A',
        lightSensor: unmarshalledItem.lightSensor || 'N/A'
      };

      // Add dynamic columns
      discoveredColumns.forEach(key => {
        if (!Object.keys(baseData).includes(key)) {
          baseData[key] = unmarshalledItem[key];  // Remove any transformation
        }
      });
    
      return baseData;
    });
    console.log('Transformed data:', data.length);

    // Sort the data by timestamp
    data.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Paginate the data
    const totalRows = data.length;
    const startIndex = (page - 1) * perPage;
    const paginatedData = data.slice(startIndex, startIndex + perPage);

    console.log('Returning paginated data:', { dataLength: paginatedData.length, totalRows });
    return {
      data: paginatedData,
      totalRows
    };
  } catch (error) {
    console.error('Error scanning DynamoDB:', error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const getDiscoveredColumns = () => discoveredColumns;

export const fetchHubIds = async () => {
  const params = {
    TableName: 'BLETesting',
    ProjectionExpression: 'hubId',
  };
  try {
    console.log('Fetching hub IDs');
    const Items = await scanAllItems(params);
    console.log('Received hub IDs:', Items.length);
    const hubIds = [...new Set(Items.map(item => item.hubId.S))];
    console.log('Unique hub IDs:', hubIds.length);
    return hubIds;
  } catch (error) {
    console.error('Error fetching hubIds from DynamoDB:', error);
    throw new Error(`Failed to fetch hubIds: ${error.message}`);
  }
};

// Function to test DynamoDB connection
export const testDynamoDBConnection = async () => {
  const params = {
    TableName: 'BLETesting',
    Limit: 1,
  };
  try {
    console.log('Testing DynamoDB connection');
    const command = new ScanCommand(params);
    const result = await ddbDocClient.send(command);
    console.log('DynamoDB connection test result:', result);
    return true;
  } catch (error) {
    console.error('DynamoDB connection test failed:', error);
    throw error;
  }
};

// Function to fetch unique goat IDs
export const fetchGoatIdsByHub = async (hubId) => {
  const params = {
    TableName: 'BLETesting',
    ProjectionExpression: 'deviceName, hubId',
  };

  if (hubId !== 'All') {
    params.FilterExpression = 'hubId = :hubId';
    params.ExpressionAttributeValues = {
      ':hubId': { S: hubId },
    };
  }

  try {
    console.log('Fetching goat IDs for hub:', hubId);
    const Items = await scanAllItems(params);
    console.log('Received items:', Items.length);
    const goatIds = [...new Set(Items.map(item => item.deviceName.S))];
    console.log('Unique goat IDs for hub:', goatIds.length);
    return goatIds;
  } catch (error) {
    console.error('Error fetching goatIds from DynamoDB:', error);
    throw new Error(`Failed to fetch goatIds: ${error.message}`);
  }
};


// Updated fetchCSV function
export const fetchCSV = async (hubId, goatId, startDate, endDate) => {
  console.log('Fetching CSV data with params:', { hubId, goatId, startDate, endDate });

  if (!startDate || !endDate) {
    console.error('Invalid date range:', { startDate, endDate });
    throw new Error('Invalid date range: Both start date and end date must be provided.');
  }

  if (new Date(startDate) > new Date(endDate)) {
    console.error('Invalid date range:', { startDate, endDate });
    throw new Error('Invalid date range: Start date must be before or equal to end date.');
  }

  let params = {
    TableName: 'BLETesting',
    FilterExpression: '#timestamp BETWEEN :startDate AND :endDate',
    ExpressionAttributeNames: {
      '#timestamp': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':startDate': { S: startDate },
      ':endDate': { S: endDate }
    }
  };

  if (hubId && hubId !== "All") {
    params.FilterExpression += ' AND #hubId = :hubId';
    params.ExpressionAttributeNames['#hubId'] = 'hubId';
    params.ExpressionAttributeValues[':hubId'] = { S: hubId };
  }

  if (goatId && goatId !== "All") {
    params.FilterExpression += ' AND #deviceName = :goatId';
    params.ExpressionAttributeNames['#deviceName'] = 'deviceName';
    params.ExpressionAttributeValues[':goatId'] = { S: goatId };
  }

  try {
    console.log('Scanning DynamoDB with params:', params);
    const Items = await scanAllItems(params);
    console.log('Received Items from DynamoDB:', Items.length);

    if (Items.length === 0) {
      throw new Error('No data found for the specified criteria');
    }

    const data = Items.map(item => {
      const unmarshalledItem = unmarshall(item);
      const baseData = {
        // Keep existing hardcoded mappings without transformations
        timestamp: unmarshalledItem.timestamp,
        goatId: unmarshalledItem.deviceName,
        tagId: unmarshalledItem.tagId,
        hubId: unmarshalledItem.hubId,
        temperature: unmarshalledItem.temperature,
        ambientTemperature: unmarshalledItem.ambientTemperature,
        ambientHumidity: unmarshalledItem.ambientHumidity,
        battery: unmarshalledItem.battery,
        proximity: unmarshalledItem.proximity,
        rssi: unmarshalledItem.rssi,
        lightSensor: unmarshalledItem.lightSensor
      };
    
      // Add discovered columns without transformations
      discoveredColumns.forEach(key => {
        if (!Object.keys(baseData).includes(key)) {
          baseData[key] = unmarshalledItem[key];
        }
      });
    
      return baseData;
    });

    // Sort the data by timestamp in descending order
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get all possible headers (including dynamic ones)
    const headers = Object.keys(data[0]);
    
    // Convert to CSV
    const header = headers.join(',') + '\n';
    const rows = data.map(item => 
      headers.map(header => item[header]).join(',') + '\n'
    ).join('');
    const csv = header + rows;

    console.log('Generated CSV data with', data.length, 'rows');
    return csv;
  } catch (error) {
    console.error('Error fetching CSV data from DynamoDB:', error);
    throw new Error(`Failed to fetch CSV data: ${error.message}`);
  }
};