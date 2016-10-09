/**
 * @author chenqi14
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
    var text = fs.readFileSync('log/index.log', 'utf-8').replace(/\n/g, '<br/>');
    res.send(text);
});

module.exports = router;
