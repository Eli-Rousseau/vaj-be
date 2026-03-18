``` 
DOCS: https://redis.io/docs/latest/operate/rs/references/rest-api/
```

import fetch, { Headers } from 'node-fetch';
import * as https from 'https';

const HOST = '[host]';
const PORT = '[port]';
const USERNAME = '[username]';
const PASSWORD = '[password]';

// Get the list of databases using GET /v1/bdbs
const BDBS_URI = `https://${HOST}:${PORT}/v1/bdbs`;
const USER_CREDENTIALS = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
const AUTH_HEADER = `Basic ${USER_CREDENTIALS}`;

console.log(`GET ${BDBS_URI}`);

const HTTPS_AGENT = new https.Agent({
    rejectUnauthorized: false
});

const response = await fetch(BDBS_URI, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Authorization': AUTH_HEADER
    },
    agent: HTTPS_AGENT
});

const responseObject = await response.json();
console.log(`${response.status}: ${response.statusText}`);
console.log(responseObject);

// Rename all databases using PUT /v1/bdbs
for (const database of responseObject) {
    const DATABASE_URI = `${BDBS_URI}/${database.uid}`;
    const new_name = `database${database.uid}`;

    console.log(`PUT ${DATABASE_URI}`);

    const response = await fetch(DATABASE_URI, {
        method: 'PUT',
        headers: {
            'Authorization': AUTH_HEADER,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'name': new_name
        }),
        agent: HTTPS_AGENT
    });

    console.log(`${response.status}: ${response.statusText}`);
    console.log(await(response.json()));
}
