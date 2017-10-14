const app = require('express')();
const bodyParser = require('body-parser');
const messages = require('./messages-util');

var inRoom=0;
var msgWaitClients = [];
var statsWaitClients = [];

function getStats(){
    var stats={};
    inRoom=Math.max(0, inRoom);
    stats.users=inRoom;
    stats.messages=messages.getMessagesAmount();
    return stats;
}

function sendStats(){
    //for clients that are waiting for stats
    var stats=getStats();
    console.log(stats);
    console.log("waiting "+statsWaitClients.length);
    while(statsWaitClients.length > 0) {
        var client = statsWaitClients.pop();
        client.send(JSON.stringify(stats));
    }
    console.log("end waiting "+statsWaitClients.length);
}

function sendMsgs(){
    //a map of counter to msg array
    var msgsForCounter={};
    
    //for clients that are waiting for messages
    while(msgWaitClients.length > 0) {
        var client = msgWaitClients.pop();
        var msgArr=msgsForCounter[''+client.counter];
        if(!msgArr){
            var t=messages.getMessages(client.counter);
            msgsForCounter[''+client.counter]=t
            msgArr=t;
        }  
        client.res.send(JSON.stringify(msgArr));
    }
}
app.use(bodyParser.json()); // for parsing application/json
app.use(function(req, res, next) {
    //set header for all
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
app.post('/messages', function (req, res) {
    console.log(req.body);
    if(!req.body)
        res.status(400).send(); 
    var msgId=messages.addMessage(req.body);
    console.log("posted"+msgId);   
    sendMsgs();
    sendStats();
    res.end(JSON.stringify(msgId));
})
app.get('/stats', function (req, res) {
    statsWaitClients.push(res);
    console.log("pushed "+statsWaitClients.length);
})
app.get('/messages?', function (req, res) {
    var data = req.query;
    if(data.counter){
        if(isNaN(data.counter))
            res.status(400).send();
        else {
            var msgArr=messages.getMessages(data.counter);
            if(msgArr.length > 0){
                res.send(JSON.stringify(msgArr));
            }         
            else{
                var clientStruct={};
                clientStruct.res=res;
                clientStruct.counter=data.counter;
                msgWaitClients.push(clientStruct);
                console.log("pushed msg "+msgWaitClients.length);
            }
                
        }
    } else {
        res.status(400).send(); 
    }
})
app.get('/exit', function (req, res) {
    inRoom--;
    console.log("exited "+inRoom);
    sendStats();
    res.send(); 
})
app.get('/enter', function (req, res) {
    inRoom++;
    console.log("entered "+inRoom);
    sendStats();
    res.send(); 
})
app.get('/reEnter', function (req, res) {
    sendStats();
    res.send(); 
})
app.delete('/messages/:id', function (req, res) {
    var msgId=req.params.id
    if(isNaN(msgId))
        res.status(400).send();
    else {
        var deleted=messages.deleteMessage(msgId);
        if(deleted)
            sendStats();
        res.send(JSON.stringify(deleted));
    }   
})
app.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.status(204).send();
});
app.all('/stats', function (req, res) {
    res.status(405).send(); 
})
app.all('/messages', function (req, res) {
    res.status(405).send(); 
})
app.all('/exit', function (req, res) {
    res.status(405).send(); 
})
app.all('/enter', function (req, res) {
    res.status(405).send(); 
})
app.use('/*', function (req, res) {
    res.status(404).send(); 
})
app.listen(9000, function () {
    console.log('listening on port 9000...')
});