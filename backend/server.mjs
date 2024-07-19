import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';

config();

const app = express();
const port = 3000;


app.use(cors());
app.use(json());

const filterServerNames = (servers) => {
    const excludePatterns = ["1N", "2N", "3D", "LD", "NY"];
    return servers.filter(server => 
        !excludePatterns.some(pattern => server.name.includes(pattern))
    );
};

app.get('/api/credentials', (req, res) => {
    res.json({
        clientId: process.env.CLIENT_ID,
        apiSecret: process.env.API_SECRET
    });
});

app.get('/api/servers', async (req, res) => {
    try {
        const response = await fetch('https://console.kamatera.com/service/servers', {
            method: 'GET',
            headers: {
                'AuthClientId': process.env.CLIENT_ID,
                'AuthSecret': process.env.API_SECRET
            }
        });

        if (response.ok) {
            let servers = await response.json();
            servers = filterServerNames(servers);
            res.json(servers);
            console.log("Filtered servers:", servers);
        } else {
            const errorText = await response.text();
            console.error('Error fetching servers:', errorText);
            res.status(response.status).json({ error: errorText });
        }
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/server/:serverId/power', async (req, res) => {
    const serverId = req.params.serverId;
    const powerState = req.body.power;

    try {
        const response = await fetch(`https://console.kamatera.com/service/server/${serverId}/power`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'AuthClientId': process.env.CLIENT_ID,
                'AuthSecret': process.env.API_SECRET
            },
            body: new URLSearchParams({ power: powerState })
        });

        if (response.ok) {
            const result = await response.json();
            res.json(result);
        } else {
            const errorText = await response.text();
            console.error(`Error ${powerState} server ${serverId}:`, errorText);
            res.status(response.status).json({ error: errorText });
        }
    } catch (error) {
        console.error(`Server error ${powerState} server ${serverId}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
