/**
 * Created by cl-macmini-132 on 14/06/16.
 */


var Joi =require("joi"),
    async =require("async"),
    _ = require("underscore"),
    moment = require("moment"),
    lib = require("../../lib"),
    config = require("../../config"),
    connection = require("../../db");


module.exports.LogoutCtrl = function(req,res,next){


    var dataObject;

    var context = req.originalUrl;

    async.waterfall([
            function(cb){

                lib.utils.validateAccessToken(req.headers.authorization,function(err,valid,decoded){
                    if(err){
                        lib.logging.logError(context, err);
                        cb({status: 500});
                    }
                    else if(!valid){
                        cb({status : 401});
                    }
                    else{
                        dataObject = decoded;
                        cb(null);
                    }
                });
            },

            function(cb){


                var sql = "UPDATE users SET access_token=? WHERE id=?";
                connection.query(sql,["",dataObject.id],function(err,result){
                    if(err){
                        lib.logging.logError(context,err);
                        cb({status :500});
                    }
                    else{
                        cb(null,{status:200, data : {}});
                    }
                })
            }

        ],
        function(err,result){

            if(err){
                res.status(err.status).send({
                    message :lib.utils.getErrorMessage(err.status),
                    status : err.status,
                    data : result
                });
            }
            else{
                res.status(result.status).send({
                    message : lib.utils.getSuccessMessage(result.status),
                    status : result.status,
                    data : result.data
                })
            }
        });
};


module.exports.ProfileViewCtrl = function(req,res,next){


    var dataObject;

    var context = req.originalUrl;


    async.waterfall([
            function(cb){

                lib.utils.validateAccessToken(req.headers.authorization,function(err,valid,decoded){
                    if(err){
                        lib.logging.logError(context, err);
                        cb({status: 500});
                    }
                    else if(!valid){
                        cb({status : 401});
                    }
                    else{
                        dataObject = decoded;
                        cb(null);
                    }
                });
            },

            function(cb){


                var sql = "SELECT * FROM users WHERE id=?";
                connection.query(sql,[dataObject.id],function(err,result){
                    if(err){
                        lib.logging.logError(context,err);
                        cb({status :500});
                    }
                    else{

                        var response = _.pick(result[0],["email","name","gender","mobile"]);
                        cb(null,{status:200, data : response});
                    }
                })
            }

        ],
        function(err,result){

            if(err){
                res.status(err.status).send({
                    message :lib.utils.getErrorMessage(err.status),
                    status : err.status,
                    data : result
                });
            }
            else{
                res.status(result.status).send({
                    message : lib.utils.getSuccessMessage(result.status),
                    status : result.status,
                    data : result.data
                });
            }
        });
};


module.exports.ProfileUpdateCtrl = function(req,res,next){


    var dataObject = req.body;

    var context = req.originalUrl;

    var schema = Joi.object().keys({
        name : Joi.string().min(6),
        gender : Joi.any().valid("m","f")

    });


    async.waterfall([
            function(cb){

                lib.utils.validateAccessToken(req.headers.authorization,function(err,valid,decoded){
                    if(err){
                        lib.logging.logError(context, err);
                        cb({status: 500});
                    }
                    else if(!valid){
                        cb({status : 401});
                    }
                    else{
                        dataObject.id = decoded.id;
                        cb(null);
                    }
                });
            },

            function(cb){


                var sql = "UPDATE users SET name=?,gender=? WHERE id=?";
                connection.query(sql,[dataObject.name,dataObject.gender,dataObject.id],function(err,result){
                    if(err){
                        lib.logging.logError(context,err);
                        cb({status :500});
                    }
                    else{
                        cb(null,{status:200, data : {}});
                    }
                })
            }

        ],
        function(err,result){

            if(err){
                res.status(err.status).send({
                    message :lib.utils.getErrorMessage(err.status),
                    status : err.status,
                    data : result
                });
            }
            else{
                res.status(result.status).send({
                    message : lib.utils.getSuccessMessage(result.status),
                    status : result.status,
                    data : result.data
                });
            }
        });
};