/**
 *It declares web routes and their specific controllers
 *
 */

var express = require('express'),
    controllers = require("../controllers");


var router = express.Router();




router.get('/home',controllers.web.HomeCtrl);






module.exports = router;