import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [clientId, setClientId] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [servers, setServers] = useState([]);
  const [status, setStatus] = useState('off');

  useEffect(() => {
    fetchCredentials().then(fetchServers);
  }, []);

  const fetchCredentials = async () => {
    const response = await fetch('http://localhost:3000/api/credentials');
    const credentials = await response.json();
    setClientId(credentials.clientId);
    setApiSecret(credentials.apiSecret);
  };

  const fetchServers = async () => {
    const response = await fetch('http://localhost:3000/api/servers');
    if (response.ok) {
      const servers = await response.json();
      setServers(servers);
    } else {
      console.error('Failed to fetch servers');
    }
  };

  const powerServers = async (powerState) => {
    for (const server of servers) {
      try {
        const response = await fetch(`http://localhost:3000/api/server/${server.id}/power`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ power: powerState })
        });

        if (response.ok) {
          alert(`Server ${server.id} ${powerState} successfully!`);
          setStatus(powerState);
        } else {
          const result = await response.json();
          alert(`Failed to ${powerState} server ${server.id}: ${result.error}`);
        }
      } catch (error) {
        console.error(`Error ${powerState} server ${server.id}:`, error);
        alert(`An error occurred while ${powerState} server ${server.id}.`);
      }
    }

    fetchServers(); // Refresh the server status after powering on/off
  }

  return (
    <div className="App">
      <h1>Kamatera Server Control</h1>
      <div className="button-container">
        <button onClick={() => powerServers('on')} className="control-button">Start Servers</button>
        <button onClick={() => powerServers('off')} className="control-button">Stop Servers</button>
        <button onClick={() => powerServers('restart')} className="control-button">Restart Servers</button>
      </div>
      <div id="serverStatus" className="status-container">
        <div className="status-header">Server Status</div>
        <div className="status-list">
          {servers.map(server => (
            <div key={server.id} className={`status-item ${server.status === 'active' ? 'active' : 'inactive'}`}>
              <span>{server.name}</span>
              <span className={`status ${server.status === 'active' ? 'on' : 'off'}`}></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
