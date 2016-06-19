
var config = require("../config"),
    md5 = require("md5"),
    jwt = require('jsonwebtoken'),
    AWS = require("aws-sdk"),
    fileType = require("file-type"),
    randomstring = require("randomstring"),
    fs = require("fs"),
    gm = require("gm"),
    db = require("../db");

module.exports.getErrorMessage = function(status){

    var messages = {
        400 : "Bad request.",
        401 : "Unauthorized.",
        404 : "Not found",
        409 : "User conflict.",
        500 : "Internal server error."
    };

    return messages[status];

};


module.exports.getSuccessMessage = function(status){

    var messages = {
        200 : "OK",
        201 : "Created."
    };

    return messages[status];

};


module.exports.hashPassword = function(pass){

    return md5(pass);
};

module.exports.generateAccessToken = function(payload,cb){

    jwt.sign(payload,config.HMACKey,{},function(err,token){
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
            db.query(sql,[decoded.id,token],function(err,result){

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

module.exports.uploadFile = function(file,folder,imageSize,fileName,callback) {


    AWS.config.update({
        accessKeyId: config.aws.accessKey,
        secretAccessKey: config.aws.secretKey
    });

    var S3 = new AWS.S3();

    fs.readFile(file.path,{},function(err,data){

        if(err){
            callback(err);
        }
        else{

            var fileDetails = fileType(data);
            if(fileDetails==null || fileDetails.mime.match(/image/g)==null){
                callback({status : 400});
                return;
            }



            gm(data,"image."+fileDetails.ext)
                .resize(config.imageSizes[imageSize].height,config.imageSizes[imageSize].width)
                .toBuffer("PNG",function(err,buffer){

                    if(err){
                        callback(err);
                    }
                    else{

                        var key = folder+"/"+fileName+ "_"+imageSize+".png";

                        var params = {
                            Bucket:config.aws.bucket,
                            ACL:'public-read',
                            Key:key,
                            Body:buffer,
                            ContentType:"image/png"
                        };

                        S3.upload(params,function(err,data){

                            if(err){
                                callback(err);
                            }
                            else{
                                callback(null,data.Location);
                            }


                        });
                    }
                });


        }
    });


};

module.exports.generateFileName = function(length){

    return randomstring.generate(length);
};

module.exports.deleteFile = function(file){
    fs.unlink(file.path);
};
