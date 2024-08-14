// src/utils/dataFetcher.js
import { ddbDocClient } from '../aws-config';
import { ScanCommand } from "@aws-sdk/client-dynamodb";

export const fetchData = async (tagId, sortOrder = 'asc') => {
  let params = {
    TableName: 'BLETesting',
  };

  if (tagId !== "All") {
    params.FilterExpression = '#tag = :tagId';
    params.ExpressionAttributeNames = {
      '#tag': 'tagId',
    };
    params.ExpressionAttributeValues = {
      ':tagId': { S: tagId },
    };
  }

  try {
    const command = new ScanCommand(params);
    const { Items } = await ddbDocClient.send(command);

    const data = Items.map(item => ({
      timestamp: new Date(item.timestamp.S).toLocaleString(),
      timestampRaw: item.timestamp.S,
      tagId: item.tagId.S,
      deviceName: item.deviceName.S,
      hubId: item.hubId.S,
      temperature: item.temperature.N,
      ambientTemperature: item.ambientTemperature.N,
      ambientHumidity: item.ambientHumidity.N,
      battery: item.battery.N,
      proximity: item.proximity.N,
      rssi: item.rssi.N
    }));

    data.sort((a, b) => {
      return sortOrder === 'asc' 
        ? new Date(a.timestampRaw) - new Date(b.timestampRaw)
        : new Date(b.timestampRaw) - new Date(a.timestampRaw);
    });

    return data;

  } catch (error) {
    console.error('Error scanning DynamoDB:', error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const fetchTagIds = async () => {
  const params = {
    TableName: 'BLETesting',
    ProjectionExpression: 'tagId', // Only retrieve the tagId attribute
  };

  try {
    const command = new ScanCommand(params);
    const { Items } = await ddbDocClient.send(command);

    // Extract and return unique tagIds
    const tagIds = [...new Set(Items.map(item => item.tagId.S))];
    return tagIds;

  } catch (error) {
    console.error('Error fetching tagIds from DynamoDB:', error);
    throw new Error(`Failed to fetch tagIds: ${error.message}`);
  }
};

export const testDynamoDBConnection = async () => {
  const params = {
    TableName: 'BLETesting',
    Limit: 1,
  };

  try {
    const command = new ScanCommand(params);
    const { Items } = await ddbDocClient.send(command);
    return true;
  } catch (error) {
    console.error('DynamoDB connection test failed:', error);
    throw error;
  }
};
