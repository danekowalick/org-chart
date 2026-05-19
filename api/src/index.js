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

function getUser(request) {
  const header = request.headers.get('x-ms-client-principal');
  if (!header) return null;
  try {
    const decoded = Buffer.from(header, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (e) { return null; }
}

function isAdmin(user) {
  return user && Array.isArray(user.userRoles) && user.userRoles.includes('admin');
}

const ADMIN_EMAILS = [
  'dane.k@koblesystems.com',
  'kelsey@koblesystems.com',
  'george@koblesystems.com',
  'claire@koblesystems.com',
];

app.http('roles', {
  methods: ['GET', 'POST'],
  handler: async (request, context) => {
    if (request.method === 'GET') {
      return { status: 200, jsonBody: { hello: 'roles endpoint is alive' } };
    }
    try {
      const body = await request.json();
      const email = (body.userDetails || '').toLowerCase().trim();
      const roles = ADMIN_EMAILS.includes(email) ? ['admin'] : [];
      return { status: 200, jsonBody: { roles } };
    } catch (err) {
      context.error('roles handler error:', err);
      return { status: 200, jsonBody: { roles: [] } };
    }
  },
});

app.http('employees', {
  methods: ['GET', 'PUT'],
  handler: async (request, context) => {
    try {
      const container = await getContainer();
      if (request.method === 'GET') {
        try {
          const { resource } = await container.item('employees', 'employees').read();
          return { status: 200, jsonBody: (resource && resource.data) || [] };
        } catch (err) {
          if (err.code === 404) return { status: 200, jsonBody: [] };
          throw err;
        }
      }
      if (request.method === 'PUT') {
        const user = getUser(request);
        // TEMP: Hardcoded admin email check while we debug roles
const adminEmails = ['dane.k@koblesystems.com', 'kelsey@koblesystems.com', 'george@koblesystems.com', 'claire@koblesystems.com'];
const email = user && user.userDetails && user.userDetails.toLowerCase();
if (!email || !adminEmails.includes(email)) {
  return { status: 403, jsonBody: { error: 'Admin email required' } };
}
        const body = await request.json();
        if (!Array.isArray(body)) {
          return { status: 400, jsonBody: { error: 'Body must be a JSON array' } };
        }
        await container.items.upsert({
          id: 'employees', data: body, updatedAt: new Date().toISOString(),
          updatedBy: user.userDetails,
        });
        return { status: 200, jsonBody: { ok: true, count: body.length } };
      }
      return { status: 405, jsonBody: { error: 'Method not allowed' } };
    } catch (err) {
      context.error('employees handler error:', err);
      return { status: 500, jsonBody: { error: 'Internal error', message: err.message } };
    }
  },
});

app.http('teams', {
  methods: ['GET', 'PUT'],
  handler: async (request, context) => {
    try {
      const container = await getContainer();
      if (request.method === 'GET') {
        try {
          const { resource } = await container.item('teams', 'teams').read();
          return { status: 200, jsonBody: (resource && resource.data) || {} };
        } catch (err) {
          if (err.code === 404) return { status: 200, jsonBody: {} };
          throw err;
        }
      }
      if (request.method === 'PUT') {
        const user = getUser(request);
        // TEMP: Hardcoded admin email check while we debug roles
const adminEmails = ['dane.k@koblesystems.com', 'kelsey@koblesystems.com', 'george@koblesystems.com', 'claire@koblesystems.com'];
const email = user && user.userDetails && user.userDetails.toLowerCase();
if (!email || !adminEmails.includes(email)) {
  return { status: 403, jsonBody: { error: 'Admin email required' } };
}
        const body = await request.json();
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return { status: 400, jsonBody: { error: 'Body must be a JSON object' } };
        }
        await container.items.upsert({
          id: 'teams', data: body, updatedAt: new Date().toISOString(),
          updatedBy: user.userDetails,
        });
        return { status: 200, jsonBody: { ok: true, count: Object.keys(body).length } };
      }
      return { status: 405, jsonBody: { error: 'Method not allowed' } };
    } catch (err) {
      context.error('teams handler error:', err);
      return { status: 500, jsonBody: { error: 'Internal error', message: err.message } };
    }
  },
});
