const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

let _container = null;
async function getContainer() {
  if (_container) return _container;
  const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,
  });
  const { database } = await client.databases.createIfNotExists({
    id: process.env.COSMOS_DATABASE || 'atlas',
  });
  const { container } = await database.containers.createIfNotExists({
    id: process.env.COSMOS_CONTAINER || 'orgData',
    partitionKey: { paths: ['/id'] },
  });
  _container = container;
  return _container;
}

// GET /api/employees → returns saved array (or [])
// PUT /api/employees → replaces the saved array
app.http('employees', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'employees',
  handler: async (request, context) => {
    try {
      const container = await getContainer();

      if (request.method === 'GET') {
        try {
          const { resource } = await container.item('employees', 'employees').read();
          const data = (resource && resource.data) || [];
          return { status: 200, jsonBody: data };
        } catch (err) {
          if (err.code === 404) return { status: 200, jsonBody: [] };
          throw err;
        }
      }

      if (request.method === 'PUT') {
        const body = await request.json();
        if (!Array.isArray(body)) {
          return { status: 400, jsonBody: { error: 'Body must be a JSON array' } };
        }
        await container.items.upsert({
          id: 'employees', data: body, updatedAt: new Date().toISOString(),
        });
        return { status: 200, jsonBody: { ok: true, count: body.length } };
      }

      return { status: 405, jsonBody: { error: 'Method not allowed' } };
    } catch (err) {
      context.error('employees handler error:', err);
      return {
        status: 500,
        jsonBody: { error: 'Internal error', message: err.message, code: err.code },
      };
    }
  },
});

// GET /api/teams → returns the team palette object (or {})
// PUT /api/teams → replaces the team palette
app.http('teams', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'teams',
  handler: async (request, context) => {
    try {
      const container = await getContainer();

      if (request.method === 'GET') {
        try {
          const { resource } = await container.item('teams', 'teams').read();
          const data = (resource && resource.data) || {};
          return { status: 200, jsonBody: data };
        } catch (err) {
          if (err.code === 404) return { status: 200, jsonBody: {} };
          throw err;
        }
      }

      if (request.method === 'PUT') {
        const body = await request.json();
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return { status: 400, jsonBody: { error: 'Body must be a JSON object' } };
        }
        await container.items.upsert({
          id: 'teams', data: body, updatedAt: new Date().toISOString(),
        });
        return { status: 200, jsonBody: { ok: true, count: Object.keys(body).length } };
      }

      return { status: 405, jsonBody: { error: 'Method not allowed' } };
    } catch (err) {
      context.error('teams handler error:', err);
      return {
        status: 500,
        jsonBody: { error: 'Internal error', message: err.message, code: err.code },
      };
    }
  },
});
