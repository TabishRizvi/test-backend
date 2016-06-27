/* Configuration file for app */


module.exports = {

    port : 7777,
    mysql:{
        host:'localhost',
        port:3306,
        user:'*****',
        password:'************',
        database:'test-backend',
        dateStrings:true
    },
    aws:{
        accessKey:'***************',
        secretKey:'***************************',
        bucket:'test-backend'
    },
    HMACKey:'********************',
    defaultPic :"https://test-backend.s3.amazonaws.com/profile-pic/default_normal.png",
    defaultThumb :"https://test-backend.s3.amazonaws.com/profile-pic/default_thumb.png",
    imageSizes :{
        normal : {
            height : 300,
            width : 300
        },
        thumb : {
            height : 100,
            width : 100
        }
    },
    fileNameLength : 7
};

