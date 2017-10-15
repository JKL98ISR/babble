(function () {
    var messagesHelper={};
    var msgList=[];
    var addedCounter=0;
    var deletedCounter=0;
    const md5 = require('md5');
    function gravAvatarGetter(email){
        var emailHash=md5(email);
        return 'https://www.gravatar.com/avatar/'+emailHash+'.jpg?d=identicon';
    }
    messagesHelper.addMessage = function(message) {
        message.id=addedCounter;
        //add gravatar if user isn't anonymous
        if(message.email)
            message.img=gravAvatarGetter(message.email);
        //if anonymous set the name as "Anonymous" 
        if(!message.name)
            message.name='Anonymous';
        msgList.push(message);
        return addedCounter++;;
    }
    messagesHelper.getMessages = function(counter) {
        var msgAmount=msgList.length; 
        if(counter<msgAmount)
            return msgList.slice(counter, msgAmount);
        return [];
    }
    //removes the message with the given id from the array by setting it's cell as empty
    messagesHelper.deleteMessage = function(id){
        var msgLen=msgList.length;
		var wasDeleted=false;
        for(var i=0;i<msgLen;i++){
            if(msgList[i].id==id){
                msgList[i]={};
                wasDeleted=true;
                break;
            }
        }
        if(wasDeleted)
            deletedCounter++;
        return wasDeleted;
    }
    messagesHelper.getMessagesAmount = function(){
        return addedCounter-deletedCounter;
    }
    module.exports = messagesHelper;
}.call(this));