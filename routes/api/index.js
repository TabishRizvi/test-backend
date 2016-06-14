/**
 * Created by cl-macmini-132 on 14/06/16.
 */


var express = require('express');

var apiRoutes = {
    common : require("./common"),
    user : require("./user")
};

var router = express.Router();


router.post('/common',apiRoutes.common);

router.post('/user',apiRoutes.user);

module.exports = router;