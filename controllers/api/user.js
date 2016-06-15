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

                if(req.headers.authorization==undefined || req.headers.authorization=="" ){
                    cb({ status : 400, message : "Authorization is missing."})
                }
                else{
                    cb(null);
                }
            },
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
                    data : err.data==undefined? {} : err.data
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

                if(req.headers.authorization==undefined || req.headers.authorization=="" ){
                    cb({ status : 400, message : "Authorization is missing."})
                }
                else{
                    cb(null);
                }
            },
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

                        if(result[0].is_pic==0){
                            response.pic = config.defaultPic;
                        }
                        else{
                            response.pic  = result[0].pic;
                        }
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

                if(req.headers.authorization==undefined || req.headers.authorization=="" ){
                    cb({ status : 400, message : "Authorization is missing."})
                }
                else{
                    cb(null);
                }
            },

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
                    data : err.data==undefined? {} : err.data
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


module.exports.ProfilePicUpdateCtrl = function(req,res,next){


    var context = req.originalUrl;

    var dataObject ={};

    async.waterfall([

            function(cb){

                if(req.headers.authorization==undefined || req.headers.authorization=="" ){
                    cb({ status : 400, message : "Authorization is missing."})
                }
                else{
                    cb(null);
                }
            },

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

                lib.utils.uploadFile(req.file,"profile-pic",function(err,uploadUrl){

                    if(err){

                        if(err.status==400){
                            cb({status : 400, data : "profilePic must be an image"});
                        }
                        else{
                            lib.logging.logError(context, err);
                            cb({status: 500});
                        }
                    }
                    else{
                        cb(null,uploadUrl);
                    }
                });
            },



            function(uploadUrl,cb){


                var sql = "UPDATE users SET is_pic=?,pic=? WHERE id=?";
                connection.query(sql,[1,uploadUrl,dataObject.id],function(err,result){
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
                    data : err.data==undefined? {} : err.data
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


module.exports.CreateTaskCtrl = function(req,res,next){


    var dataObject = req.body;

    var context = req.originalUrl;

    var schema = Joi.object().keys({
        title : Joi.string().min(1).max(50),
        description : Joi.string().min(1).max(250)
    });


    async.waterfall([

            function(cb){

                if(req.headers.authorization==undefined || req.headers.authorization=="" ){
                    cb({ status : 400, message : "Authorization is missing."})
                }
                else{
                    cb(null);
                }
            },

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

                var currentMoment = moment();
                var sql = "INSERT INTO tasks(user_id,created_datetime,title,description) VALUES(?,?,?,?)";
                connection.query(sql,[dataObject.id,currentMoment.format("YYYY-MM-DD HH:mm:ss"),dataObject.title,dataObject.description],function(err,result){
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
                    data : err.data==undefined? {} : err.data
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


module.exports.ListTasksCtrl = function(req,res,next){


    var dataObject;

    var context = req.originalUrl;


    async.waterfall([

            function(cb){

                if(req.headers.authorization==undefined || req.headers.authorization=="" ){
                    cb({ status : 400, message : "Authorization is missing."})
                }
                else{
                    cb(null);
                }
            },
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


                var sql = "SELECT id as taskId,created_datetime as dateCreated,title FROM tasks WHERE user_id=?";
                connection.query(sql,[dataObject.id],function(err,result){
                    if(err){
                        lib.logging.logError(context,err);
                        cb({status :500});
                    }
                    else{

                        var response = result;

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
                });
            }
        });
};

module.exports.TaskDetailCtrl = function(req,res,next){


    var dataObject = req.params;

    var context = req.originalUrl;

    var schema = Joi.object().keys({
        taskId : Joi.number().integer()
    });



    async.waterfall([

            function(cb){

                if(req.headers.authorization==undefined || req.headers.authorization=="" ){
                    cb({ status : 400, message : "Authorization is missing."})
                }
                else{
                    cb(null);
                }
            },

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


                var sql = "SELECT id as taskId,created_datetime as dateCreated,title,description FROM tasks WHERE id=?";
                connection.query(sql,[dataObject.taskId],function(err,result){
                    if(err){
                        lib.logging.logError(context,err);
                        cb({status :500});
                    }
                    else{

                        var response = result[0];

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
                });
            }
        });
};