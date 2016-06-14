/* Configuration file for app */


module.exports = {

    port : 7777,
    mysql:{
        host:'localhost',
        port:3306,
        user:'tabish',
        password:'clickpass',
        database:'test-backend',
        dateStrings:true
    },
    aws:{
        accessKey:'AKIAI7QB57Y63SCQP55A',
        secretKey:'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',
        bucket:'test-backend'
    },
    HMACKey:'mrGygohOaZ2RHoEG9hmm'
};

