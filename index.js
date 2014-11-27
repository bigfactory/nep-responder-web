var url = require('url');
var request = require('nep-request');

module.exports = function(req, res, next, data) {
    var options = data.options;
    var file = options.file;
    var log = data.log;

    // Fix the host of request header to the web file's host
    var remoteHost = url.parse(file).host;
    req.headers && (req.headers.host = remoteHost);

    var options = {
        url: file,
        method: req.method,
        headers: req.headers
    };

    function callback(err, data, proxyRes) {
        if (err) {
            throw err;
        }
        res.status(proxyRes.statusCode);
        res.set(proxyRes.headers);
        res.send(data);

        next();
    };

    if (req.method == 'POST') {
        var body = '';
        req.on('data', function(data) {
            body += data;
        });
        req.on('end', function() {
            options['data'] = body;
            request(options, callback);
        });
    }
    else {
        request(options, callback);
    }
};