/**
 * Created by cl-macmini-132 on 14/06/16.
 */

var express = require('express'),
    controllers = require("../../controllers");


var router = express.Router();


router.delete('/logout',controllers.api.user.LogoutCtrl);

router.get('/profile-view',controllers.api.user.ProfileViewCtrl);

router.put('/profile-update',controllers.api.user.ProfileUpdateCtrl);

module.exports = router;