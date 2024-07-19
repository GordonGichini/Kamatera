import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [clientId, setClientId] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [serverIds, setServerIds] = useState([]);
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
      setServerIds(servers.map(server => server.id));
    } else {
      console.error('Failed to fetch servers');
    }
  };

  const powerServers = async (powerState) => {
    for (const serverId of serverIds) {
      try {
        const response = await fetch(`http://localhost:3000/api/server/${serverId}/power`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ power: powerState })
        });

        if (response.ok) {
          alert(`Server ${serverId} ${powerState} successfully!`);
          setStatus(powerState);
        } else {
          const result = await response.json();
          alert(`Failed to ${powerState} server ${serverId}: ${result.error}`);
        }
      } catch (error) {
        console.error(`Error ${powerState} server ${serverId}:`, error);
        alert(`An error occurred while ${powerState} server ${serverId}.`);
      }
    }
  };

  return (
    <div className="App">
      <h1>Kamatera Server Control</h1>
      <div className="button-group">
      <button className="control-button" onClick={() => powerServers('on')}>ON</button>
      <button className="control-button" onClick={() => powerServers('off')}>OFF</button>
      </div>
      <div id="serverStatus" className={`status ${status}`}></div>
    </div>
  );
}

export default App;
