var config = require('./config'),
    mysql  = require('mysql');


var pool  = mysql.createPool(config.mysql);

module.exports.query = function(sql,params,cb){

    pool.getConnection(function(err, connection) {
        connection.query(sql,params, function() {

            cb.apply(this,arguments);
            connection.release();
        });
    });
};