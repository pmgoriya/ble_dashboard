import React, { useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import Header from './components/Header';
import GoatSelector from './components/GoatSelector';
import HubSelector from './components/HubSelector';
import BatteryStatus from './components/BatteryStatus';
import DateRangePicker from './components/DateRangePicker';
import { fetchData, testDynamoDBConnection, fetchCSV, fetchHubGoatMapping } from './utils/dataFetcher';
import './App.css';

function App() {
  const [showBatteryStatus, setShowBatteryStatus] = useState(false);
  const [selectedGoat, setSelectedGoat] = useState('All');
  const [data, setData] = useState([]);
  const [selectedHub, setSelectedHub] = useState('All');
  const [hubGoatMapping, setHubGoatMapping] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await testDynamoDBConnection();
        setConnectionStatus('Connected');
        console.log('DynamoDB connection successful');
        
        const mapping = await fetchHubGoatMapping();
        setHubGoatMapping(mapping);
      } catch (error) {
        setConnectionStatus('Connection Failed');
        setError(`DynamoDB connection failed: ${error.message}`);
        console.error('DynamoDB connection failed:', error);
      }
    };
    initializeApp();
  }, []);

  const hubIds = useMemo(() => ['All', ...Object.keys(hubGoatMapping)], [hubGoatMapping]);

  const availableGoats = useMemo(() => {
    if (selectedHub === 'All') {
      return ['All', ...new Set(Object.values(hubGoatMapping).flat())];
    }
    return ['All', ...(hubGoatMapping[selectedHub] || [])];
  }, [selectedHub, hubGoatMapping]);

  useEffect(() => {
    setSelectedGoat('All');
  }, [selectedHub]);


  useEffect(() => {
    const fetchDataForPage = async (page) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchData(selectedHub, selectedGoat, page, perPage, sortField, sortDirection);
        console.log('Fetched data for page:', result);

        setData(result.data);
        setTotalRows(result.totalRows);

        if (result.data.length === 0) {
          setError('No data found for the selected Hub ID and Goat ID');
        }
      } catch (error) {
        console.error('Error fetching data for page:', error);
        setError(`Failed to fetch data: ${error.message}`);
      }
      setLoading(false);
    };

    fetchDataForPage(currentPage);
  }, [selectedHub, selectedGoat, currentPage, perPage, sortField, sortDirection]);


  const columns = useMemo(
    () => [
      {
        name: 'Timestamp',
        selector: row => row.timestamp || 'N/A',
        sortable: true,
        sortField: 'timestamp',
        grow: 2,
      },
      {
        name: 'Goat ID',
        selector: row => row.goatId || 'N/A',
        sortable: false,
        grow: 1,
      },
      {
        name: 'Tag ID',
        selector: row => row.tagId || 'N/A',
        sortable: false,
        grow: 1,
      },
      {
        name: 'Hub ID',
        selector: row => row.hubId || 'N/A',
        sortable: false,
        grow: 1,
      },
      {
        name: 'Temperature',
        selector: row => row.temperature !== undefined ? row.temperature : '0',
        sortable: false,
        grow: 1,
      },
      {
        name: 'Ambient Temperature',
        selector: row => row.ambientTemperature !== undefined ? row.ambientTemperature : '0',
        sortable: false,
        grow: 1,
      },
      {
        name: 'Ambient Humidity',
        selector: row => row.ambientHumidity !== undefined ? row.ambientHumidity : '0',
        sortable: false,
        grow: 1,
      },
      {
        name: 'Light Sensor',
        selector: row => row.lightSensor !== undefined ? row.lightSensor : '0',
        sortable: false,
        grow: 1,
      },  
      {
        name: 'Battery',
        selector: row => row.battery !== undefined ? row.battery : '0',
        sortable: false,
        grow: 1,
      },
      {
        name: 'Proximity',
        selector: row => row.proximity !== undefined ? row.proximity : '0',
        sortable: false,
        grow: 1,
      },
      {
        name: 'RSSI',
        selector: row => row.rssi !== undefined ? row.rssi : '0',
        sortable: false,
        grow: 1,
      },
    ],
    []
  );

  const customStyles = {
    table: {
      style: {
        minWidth: '100%',
      },
    },
    rows: {
      style: {
        minHeight: '52px',
      },
    },
    headCells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
      },
    },
    cells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        fontSize: '14px',
      },
    },
  };

  const handleSort = (column, sortDirection) => {
    if (column.sortField === 'timestamp') {
      console.log('Sorting by timestamp:', sortDirection);
      setSortDirection(sortDirection);
    }
  };

  const handleFetchData = async () => {
    setCurrentPage(1);
  };

  const handlePageChange = page => {
    console.log('Page changed to:', page);
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage) => {
    console.log('Rows per page changed to:', newPerPage);
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleDownloadCSV = async () => {
    if (!startDate || !endDate) {
      setError('Please select a date range for CSV download');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const csvData = await fetchCSV(
        selectedHub,
        selectedGoat,
        startDate.toISOString(),
        endDate.toISOString()
      );
  
      if (!csvData || csvData.trim() === '') {
        throw new Error('No data available for the selected criteria');
      }
  
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `goat_data_${selectedHub}_${selectedGoat}_${startDate.toISOString()}_${endDate.toISOString()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log('CSV download completed');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setError(`Failed to download CSV: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="App">
      <Header />
      <main className="container">
        <div className="top-bar">
          <div className="connection-status">
            DynamoDB Status: <span className={connectionStatus === 'Connected' ? 'connected' : 'disconnected'}>{connectionStatus}</span>
          </div>
          <div className="total-entries">
            Total Entries: {totalRows}
          </div>
        </div>
        <div className="controls">
        <HubSelector selectedHub={selectedHub} setSelectedHub={setSelectedHub} hubIds={hubIds} />
          <GoatSelector selectedGoat={selectedGoat} setSelectedGoat={setSelectedGoat} availableGoats={availableGoats} />
          <button onClick={handleFetchData} disabled={loading} className="fetch-button">
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
          <DateRangePicker onDateRangeChange={handleDateRangeChange} />
          <button onClick={handleDownloadCSV} disabled={loading} className="download-button">
            {loading ? 'Downloading...' : 'Download CSV'}
          </button>
          <button onClick={() => setShowBatteryStatus(!showBatteryStatus)}>
            {showBatteryStatus ? 'Hide Battery Status' : 'Show Battery Status'}
          </button>
        </div>
        {showBatteryStatus && <BatteryStatus data={data} />}
        {error && <div className="error-message">{error}</div>}
        <DataTable
          title="Goat Monitoring Data"
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 20, 30, 40, 50]}
          onSort={handleSort}
          sortServer
          defaultSortField="timestamp"
          defaultSortAsc={false}
          customStyles={customStyles}
          responsive
          striped
        />
      </main>
    </div>
  );
}

export default App;