const  amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost',function (error0,connection) {
    if (error0){
        throw  error0
    }

   connection.createConfirmChannel(function (error1,channel) {
       if (error1){
           throw  error1
       }

       const exchange = 'direct_logs';
       const args = process.argv.slice(2);
       const msg = args.slice(1).join(' ') || 'Hello World';
       const severity = (args.length > 0)?args[0] :'info';

       channel.assertExchange(exchange,'direct',{durable:true, autoDelete:false});
       channel.assertQueue(severity, {durable: true, autoDelete: false})
       channel.bindQueue(severity,exchange,severity)
       channel.publish(exchange,severity,Buffer.from(msg),{persistent:true,mandatory:true});
       console.log(" [x] Sent %s: '%s'",severity,msg);
   });

    setTimeout(function () {
        connection.close();
        process.exit(0);
    },500)
});

