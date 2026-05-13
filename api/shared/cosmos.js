// Cosmos DB connection helper, shared by both API functions.
// Connection details come from environment variables set in Azure
// (Configuration → Application settings on the Static Web App).
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE || 'atlas';
const containerId = process.env.COSMOS_CONTAINER || 'orgData';

let _container = null;

async function getContainer() {
  if (_container) return _container;
  if (!endpoint || !key) {
    throw new Error('COSMOS_ENDPOINT and COSMOS_KEY must be set in app settings');
  }
  const client = new CosmosClient({ endpoint, key });
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ['/id'] },
  });
  _container = container;
  return _container;
}

// Read a single document by ID. Returns null if not found.
async function readDoc(id) {
  const container = await getContainer();
  try {
    const { resource } = await container.item(id, id).read();
    return resource || null;
  } catch (err) {
    if (err.code === 404) return null;
    throw err;
  }
}

// Upsert a document. The id is the document key.
async function upsertDoc(id, data) {
  const container = await getContainer();
  const doc = { id, data, updatedAt: new Date().toISOString() };
  const { resource } = await container.items.upsert(doc);
  return resource;
}

// Authenticated-user check. Static Web Apps sends a header with the user
// principal when the request was authenticated. In local dev (swa start),
// the header is absent — we allow that for ease of testing.
function getUser(req) {
  const header = req.headers && req.headers['x-ms-client-principal'];
  if (!header) return null;
  try {
    const decoded = Buffer.from(header, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

module.exports = { getContainer, readDoc, upsertDoc, getUser };
