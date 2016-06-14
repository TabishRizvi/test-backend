/**
 * Created by cl-macmini-132 on 14/06/16.
 */

var express = require('express'),
    controllers = require("../../controllers");


var router = express.Router();


router.post('/register',controllers.api.common.RegisterCtrl);

router.post('/login',controllers.api.common.RegisterCtrl);

module.exports = router;