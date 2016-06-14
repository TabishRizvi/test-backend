
var config = require("../config"),
    md5 = require("md5"),
    jwt = require('jsonwebtoken');

module.exports.getErrorMessage = function(status){

    var messages = {
        400 : "Bad request.",
        401 : "Unauthorized.",
        404 : "Not found",
        409 : "User conflict.",
        500 : "Internal server error."
    };

    if(messages[status]==undefined){
        var err = new Error("Invalid status in getErrorMessage");
        err.status = 500;
        err.type = "api";
        throw err;
    }
    else{
        return messages[status];
    }
};


module.exports.getSuccessMessage = function(status){

    var messages = {
        200 : "OK",
        201 : "Created."
    };

    if(messages[status]==undefined){
        var err = new Error("Invalid status in getSuccessMessage");
        err.status = 500;
        err.type = "api";
        throw err;
    }
    else{
        return messages[status];
    }
};


module.exports.hashPassword = function(pass){

    return md5(pass);
};

module.exports.generateAccessToken = function(payload,cb){

    jwt.sign(payload,config.HMACKey,{},function(token){
        cb(token);
    });
};

module.exports.validateAccessToken = function(token,cb){

    jwt.verify(token,config.HMACKey,function(err,decoded){
        if(err){
            cb(null,false);
        }
        else{

            var sql = "SELECT id FROM users WHERE id=? AND access_token=?";
            connection.query(sql,[decoded.id,token],function(err,result){

                if(err){
                    cb(err);
                }
                else if(result.length==0){
                    cb(null,false);
                }
                else{
                    cb(null,true,decoded);
                }
            });
        }
    });
};