const amqp = require('amqplib/callback_api');

const args = process.argv.slice(2);

if (args.length === 0){
    console.log("Usage: receive_log_direct.js [info] [warning] [error]");
    process.exit(1);
}

amqp.connect('amqp://localhost',function (error0,connection) {
    if (error0){
        throw error0;
    }

    connection.createChannel(function (error1,channel) {
        if (error1){
            throw error1;
        }
        const exchange = 'direct_logs';

        channel.assertExchange(exchange,'direct',{durable:true, autoDelete:false});

        channel.assertQueue('info',{
            durable: true,
            autoDelete: false
        },function (error2,q) {
            if (error2){
                throw error2
            }

            console.log(' [*] Waiting for logs. To exit press CTRL+C');

            args.forEach(function (severity) {
                channel.bindQueue(q.queue,exchange,severity);
            });

            channel.consume(q.queue,function (msg) {
                console.log(" [x] %s: '%s'",msg.fields.routingKey,msg.content.toString());
                channel.ack(msg)
            },{
                noAck:false
            })

        })
    })
});




