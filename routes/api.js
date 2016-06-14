var express = require('express'),
    controllers = require("../controllers");


var router = express.Router();




router.post('/register',controllers.api.common.RegisterCtrl);

router.post('/login',controllers.api.common.LoginCtrl);


router.delete('/logout',controllers.api.user.LogoutCtrl);

router.get('/profile-view',controllers.api.user.ProfileViewCtrl);

router.put('/profile-update',controllers.api.user.ProfileUpdateCtrl);







module.exports = router;