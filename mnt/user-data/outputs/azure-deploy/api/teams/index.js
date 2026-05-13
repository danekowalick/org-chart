// GET  /api/teams → returns the team palette object (or {})
// PUT  /api/teams → replaces the team palette with the request body
const { readDoc, upsertDoc, getUser } = require('../shared/cosmos');

module.exports = async function (context, req) {
  try {
    if (req.method === 'GET') {
      const doc = await readDoc('teams');
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: doc?.data || {},
      };
      return;
    }

    if (req.method === 'PUT') {
      const user = getUser(req);
      const isProduction = !!req.headers['x-ms-client-principal']
        || process.env.WEBSITE_HOSTNAME;
      if (isProduction && !user) {
        context.res = { status: 401, body: { error: 'Authentication required' } };
        return;
      }

      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        context.res = { status: 400, body: { error: 'Body must be a JSON object' } };
        return;
      }

      await upsertDoc('teams', body);
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { ok: true, count: Object.keys(body).length, updatedBy: user?.userDetails || null },
      };
      return;
    }

    context.res = { status: 405, body: { error: 'Method not allowed' } };
  } catch (err) {
    context.log.error('teams handler error:', err);
    context.res = { status: 500, body: { error: 'Internal error', message: err.message } };
  }
};
