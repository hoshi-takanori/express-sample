function notFound(req, res, next) {
  next({
    status: 404,
    error: 'Not found.',
    message: 'Sorry, that page was not found on this server.'
  });
}

function errorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    error: err.error || err.name + ' occurred.',
    message: err.message
  });
}

exports.setup = function (app) {
  app.use(notFound);
  app.use(errorHandler);
};
