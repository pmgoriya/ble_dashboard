import React, { useMemo } from 'react';

const BatteryStatus = ({ data }) => {
  const latestBatteryStatus = useMemo(() => {
    const batteryMap = new Map();
    data.forEach(item => {
      if (!batteryMap.has(item.goatId) || new Date(item.timestamp) > new Date(batteryMap.get(item.goatId).timestamp)) {
        batteryMap.set(item.goatId, item);
      }
    });
    return Array.from(batteryMap.values());
  }, [data]);

  const getBatteryColor = (voltage) => {
    if (voltage > 3.0) return 'green';
    if (voltage > 2.5) return 'purple';
    return 'red';
  };

  const formatBatteryVoltage = (battery) => {
    if (typeof battery === 'number') {
      return battery.toFixed(2);
    } else if (typeof battery === 'string') {
      const parsedBattery = parseFloat(battery);
      return isNaN(parsedBattery) ? 'N/A' : parsedBattery.toFixed(2);
    }
    return 'N/A';
  };

  return (
    <div className="battery-status">
      <h3>Latest Battery Status</h3>
      <table>
        <thead>
          <tr>
            <th>Goat ID</th>
            <th>Battery Voltage</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {latestBatteryStatus.map((item) => {
            const formattedBattery = formatBatteryVoltage(item.battery);
            const batteryColor = formattedBattery !== 'N/A' ? getBatteryColor(parseFloat(formattedBattery)) : 'inherit';
            
            return (
              <tr key={item.goatId}>
                <td>{item.goatId}</td>
                <td style={{color: batteryColor}}>
                  {formattedBattery} {formattedBattery !== 'N/A' ? 'V' : ''}
                </td>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BatteryStatus;