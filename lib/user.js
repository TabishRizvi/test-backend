
var request = require("request"),
    config = require("../config"),
    db = require("../db");


module.exports.isUserAlreadyRegistered= function(email,mobile,cb){

    var sql = "SELECT id FROM users WHERE email=? OR mobile=?";
    db.query(sql,[email,mobile],function(err,result){

        if(err){
            cb(err);
        }
        else if(result.length>0){
            cb(null,true);
        }
        else{
            cb(null,false);
        }
    });
};
