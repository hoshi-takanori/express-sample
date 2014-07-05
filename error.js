exports.notFound = function (req, res, next) {
  next({
    status: 404,
    error: 'Not found.',
    message: 'Sorry, that page was not found on this server.'
  });
};

exports.errorHandler = function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    error: err.error || err.name + ' occurred.',
    message: err.message
  });
};
