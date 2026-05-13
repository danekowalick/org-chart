// Diagnostic version: catches all errors and returns them as the response body
// so we can see what's actually going wrong on a managed Static Web Apps Functions host.
module.exports = async function (context, req) {
  const diagnostics = {
    method: req.method,
    nodeVersion: process.version,
    cosmosEndpointPresent: !!process.env.COSMOS_ENDPOINT,
    cosmosEndpointPrefix: process.env.COSMOS_ENDPOINT ? process.env.COSMOS_ENDPOINT.substring(0, 30) : null,
    cosmosKeyPresent: !!process.env.COSMOS_KEY,
    cosmosKeyLength: process.env.COSMOS_KEY ? process.env.COSMOS_KEY.length : 0,
    cosmosDatabase: process.env.COSMOS_DATABASE || null,
    cosmosContainer: process.env.COSMOS_CONTAINER || null,
  };

  try {
    // Try to load the SDK
    let CosmosClient;
    try {
      ({ CosmosClient } = require('@azure/cosmos'));
      diagnostics.sdkLoaded = true;
    } catch (e) {
      diagnostics.sdkLoaded = false;
      diagnostics.sdkLoadError = e.message;
      context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: diagnostics };
      return;
    }

    // Try to instantiate the client
    let client;
    try {
      client = new CosmosClient({
        endpoint: process.env.COSMOS_ENDPOINT,
        key: process.env.COSMOS_KEY,
      });
      diagnostics.clientCreated = true;
    } catch (e) {
      diagnostics.clientCreated = false;
      diagnostics.clientError = e.message;
      context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: diagnostics };
      return;
    }

    // Try to read from the database
    try {
      const database = client.database(process.env.COSMOS_DATABASE || 'atlas');
      const container = database.container(process.env.COSMOS_CONTAINER || 'orgData');
      const { resources } = await container.items.readAll().fetchAll();
      diagnostics.queryOk = true;
      diagnostics.docCount = resources.length;

      if (req.method === 'GET') {
        const empDoc = resources.find(r => r.id === 'employees');
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: (empDoc && empDoc.data) || [],
        };
        return;
      }

      if (req.method === 'PUT') {
        const body = req.body;
        if (!Array.isArray(body)) {
          context.res = { status: 400, body: { error: 'Body must be an array' } };
          return;
        }
        await container.items.upsert({ id: 'employees', data: body, updatedAt: new Date().toISOString() });
        context.res = { status: 200, body: { ok: true, count: body.length } };
        return;
      }

      context.res = { status: 405, body: { error: 'Method not allowed' } };
    } catch (e) {
      diagnostics.queryOk = false;
      diagnostics.queryError = e.message;
      diagnostics.queryCode = e.code;
      context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: diagnostics };
    }
  } catch (e) {
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { ...diagnostics, fatalError: e.message, stack: e.stack },
    };
  }
};
