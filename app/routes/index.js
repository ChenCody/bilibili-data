var express = require('express');
var router = express.Router();
var fs = require('fs');
var logger = require('tracer').console(
    {
      transport : function(data) {
        console.log(data.output);
        fs.appendFile('log/index.log', data.output + '\n', function(err) {
          if (err) throw err;
        });
      }
    }
);

/* GET home page. */
router.get('/', function(req, res, next) {
  logger.trace('[ua]', req.headers['user-agent'],' [ip]', getClientIp(req));
  res.render('index', { title: 'Express' });
});

function getClientIp(req) {
  return req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
}

module.exports = router;
