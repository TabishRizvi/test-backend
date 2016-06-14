var config = require('./config'),
    mysql  = require('mysql');

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(config.mysql);


    connection.connect(function(err) {
        if(err) {
            console.error('Error connecting to MySQL: ' + err.stack);
            handleDisconnect();
        }
    });

    connection.on('error', function(err) {
        console.log('Re-connecting lost connection: ' +err.stack);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}



handleDisconnect();


module.exports = connection;