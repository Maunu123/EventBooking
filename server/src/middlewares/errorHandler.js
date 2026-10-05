const errorHandler = (error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500;
    res.status(status).json({
        error: status === 500 ? 'Unable to complete your request. Please try again.' : 'Invalid request body.'
    });
};

module.exports = { errorHandler };
