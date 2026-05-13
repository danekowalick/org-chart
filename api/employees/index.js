module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { hello: 'world', method: req.method, node: process.version }
  };
};
