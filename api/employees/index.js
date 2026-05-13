// GET  /api/employees → returns the saved employees array (or empty array)
// PUT  /api/employees → replaces the saved employees array with the request body
//
// We store the entire array as a single document under id="employees" in Cosmos.
// For a directory of <500 people this is simpler and cheaper than per-employee docs,
// and matches how the frontend manages its state (one big array in memory).
const { readDoc, upsertDoc, getUser } = require('../shared/cosmos');

module.exports = async function (context, req) {
  try {
    if (req.method === 'GET') {
      const doc = await readDoc('employees');
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: doc?.data || [],
      };
      return;
    }

    if (req.method === 'PUT') {
      // Require authenticated user for writes (skip check in local dev where header is absent)
      const user = getUser(req);
      const isProduction = !!req.headers['x-ms-client-principal']
        || process.env.WEBSITE_HOSTNAME; // present in Azure
      if (isProduction && !user) {
        context.res = { status: 401, body: { error: 'Authentication required' } };
        return;
      }

      const body = req.body;
      if (!Array.isArray(body)) {
        context.res = { status: 400, body: { error: 'Body must be a JSON array' } };
        return;
      }

      await upsertDoc('employees', body);
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { ok: true, count: body.length, updatedBy: user?.userDetails || null },
      };
      return;
    }

    context.res = { status: 405, body: { error: 'Method not allowed' } };
  } catch (err) {
    context.log.error('employees handler error:', err);
    context.res = { status: 500, body: { error: 'Internal error', message: err.message } };
  }
};
