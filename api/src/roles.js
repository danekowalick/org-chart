// SWA calls this endpoint after sign-in to determine the user's roles.
// We return ["admin"] for emails in the ADMIN_EMAILS list, otherwise empty.
// The "authenticated" role is added automatically by SWA for any signed-in user.
const { app } = require('@azure/functions');

// === EDIT THIS LIST ===
// Email addresses (lowercased) of people who can edit the org chart.
// All other authenticated users get read-only access.
const ADMIN_EMAILS = [
  'dane.k@koblesystems.com',
  'kelsey@koblesystems.com',
  'george@koblesystems.com',
  'Claire@koblesystems.com',
  // 'someone.else@koblesystems.com',
];

app.http('roles', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'roles',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      // SWA sends: { identityProvider, userId, userDetails, claims }
      const email = (body.userDetails || '').toLowerCase().trim();
      const roles = ADMIN_EMAILS.includes(email) ? ['admin'] : [];
      return { status: 200, jsonBody: { roles } };
    } catch (err) {
      context.error('roles handler error:', err);
      return { status: 200, jsonBody: { roles: [] } };
    }
  },
});
