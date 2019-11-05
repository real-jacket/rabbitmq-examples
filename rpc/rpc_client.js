const amqp = require('amqplib/callback_api');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: rpc_client.js num");
    process.exit(1)
}

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw  error0
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw  error1
        }
        channel.assertQueue('', {
            exclusive: true
        }, function (error2, q) {
            if (error2) {
                throw error2
            }
            const correlatedId = generateUid();
            const num = parseInt(args[0]);

            console.log(' [x] Requesting fib(%d)', num);

            channel.consume(q.queue, function (msg) {
                if (msg.properties.correlatedId === correlatedId) {
                    console.log(' [.] Got %s', msg.content.toString());

                    setTimeout(function () {
                        connection.close();
                        process.exit(0)
                    }, 500)
                }
            }, {
                noAck: true
            });
            channel.sendToQueue('rpc_queue', Buffer.from(num.toString()), {
                correlatedId: correlatedId,
                replyTo: q.queue
            })
        })
    })
});


function generateUid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString()

}
