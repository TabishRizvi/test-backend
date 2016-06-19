
var Joi =require("joi"),
    async =require("async"),
    _ = require("underscore"),
    moment = require("moment"),
    lib = require("../../lib"),
    config = require("../../config"),
    db = require("../../db");


module.exports.RegisterCtrl = function(req,res,next){


    var context = req.originalUrl;

    var dataObject = req.body;

    var schema = Joi.object().keys({
        email: Joi.string().email(),
        name : Joi.string().min(6),
        gender : Joi.any().valid("m","f"),
        password : Joi.string().min(6),
        mobile : Joi.string().length(10)

    });


    async.waterfall([
        function(cb){
            Joi.validate(dataObject,schema,{presence : "required"},function(err){

                if(err){
                    lib.logging.logError(context,err);
                    cb({status :400, data: err.details[0].message.replace(/["]/ig, '')});
                }

                else{
                    cb(null);
                }
            });
        },

        function(cb){

            lib.user.isUserAlreadyRegistered(dataObject.email,dataObject.mobile,function(err,isPresent){
                if(err){
                    lib.logging.logError(context,err);
                    cb({status :500});
                }
                else if(isPresent){
                    cb({status :409});
                }
                else{
                    cb(null);
                }
            });
        },

        function(cb){

            dataObject.password = lib.utils.hashPassword(dataObject.password);

            var sql ="INSERT INTO users(email,name,gender,mobile,password) VALUES(?,?,?,?,?)";
            db.query(sql,[dataObject.email,dataObject.name,dataObject.gender,dataObject.mobile,dataObject.password],function(err,result){

                if(err){
                    lib.logging.logError(context,err);
                    cb({status :500});
                }
                else{
                    cb(null,{status :201,data : {}});
                }
            });
        }
    ],
    function(err,result){

        if(err){
            res.status(err.status).send({
                message :lib.utils.getErrorMessage(err.status),
                status : err.status,
                data : err.data==undefined?{}:err.data
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

module.exports.LoginCtrl = function(req,res,next){


    var context = req.originalUrl;

    var dataObject = req.body;

    var schema = Joi.object().keys({
        email: Joi.string().email(),
        password : Joi.string()

    });


    async.waterfall([
            function(cb){
                Joi.validate(dataObject,schema,{},function(err){

                    if(err){
                        lib.logging.logError(context,err);
                        cb({status :400, data: err.details[0].message.replace(/["]/ig, '')});
                    }

                    else{
                        cb(null);
                    }
                });
            },

            function(cb){

                dataObject.password = lib.utils.hashPassword(dataObject.password);


                var sql ="SELECT id FROM users WHERE email=? AND password=?";
                db.query(sql,[dataObject.email,dataObject.password],function(err,result){

                    if(err) {
                        lib.logging.logError(context, err);
                        cb({status: 500});
                    }
                    else if(result.length==0){
                        cb({status: 401});
                    }
                    else{
                        dataObject.id = result[0].id;
                        cb(null);
                    }
                });
            },

            function(cb){

                var payload = {
                    id : dataObject.id
                };
                lib.utils.generateAccessToken(payload,function(token){
                    dataObject.accessToken = token;
                    cb(null);
                });
            },

            function(cb){

                var sql = "UPDATE users SET access_token=? WHERE id=?";
                db.query(sql,[dataObject.accessToken,dataObject.id],function(err,result){
                    if(err){
                        lib.logging.logError(context,err);
                        cb({status :500});
                    }
                    else{

                        var response = {
                            accessToken : dataObject.accessToken
                        };
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
                    data : err.data==undefined?{}:err.data
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

