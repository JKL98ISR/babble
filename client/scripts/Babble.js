window.Babble = (function () {
    counter=0;
    user={};
    user.name='';
    user.email='';
    serverUrl='http://localhost:9000/';
    isAnon=true;

    //if browser supports local storage and doesn't have 'babble' in the local storage, initialize it
    if(localStorage && !localStorage.getItem("babble"))  {
        var data={};
        data.currentMessage='';
        data.userInfo={};
        data.userInfo.name='';
        data.userInfo.email='';
        data.tabsCounter='0';
        localStorage.setItem('babble', JSON.stringify(data));
    } 

    register=function(userInfo) {
        user.name=userInfo.name;
        user.email=userInfo.email;
        isAnon=false;
        addUserToLocalStorage();
    }
    getMessages=function(counter, callback) {
        ajaxGet(
            'messages?counter='+counter, 
            function (response) {
                if(callback)
                    if(response)
                        callback(JSON.parse(response));
                    else
                        callback();
        });   
    }
    postMessage=function(message, callback) {
        console.log("post");
        ajaxPost(
            'messages', message,
            function (response) {
                if(response){
                    var id=JSON.parse(response);
                }
                if(callback)
                    if(response)
                        callback(JSON.parse(response));
                    else
                        callback();
        });  
    }
    deleteMessage=function(id, callback) {
        ajaxDelete(
            'messages/'+id, 
            function (response) {
                if(response){
                    var deleted=JSON.parse(response);
                    console.log(response);
                }
                if(callback)
                    if(response)
                        callback(JSON.parse(response));
                    else
                        callback();
        });
    }
    getStats=function(callback) {
        console.log("in stats");
        ajaxGet(
            'stats', 
            function (response) {
                console.log(response);
                if(callback)
                    if(response)
                        callback(JSON.parse(response));
                    else
                        callback();
                    
        });   
    }
    enter=function(callback) {
        ajaxGet('enter', callback);
    }
    exit=function(callback) {
        ajaxGet('exit', callback);
    }
    reEnter=function(callback) {
        console.log("reEnter");
        ajaxGet('reEnter', callback);
    }
    function addUserToLocalStorage(){
        if(!localStorage)
            return;
        var data=JSON.parse(localStorage.getItem("babble"));
        data.userInfo.name=user.name;
        data.userInfo.email=user.email;
        localStorage.setItem('babble', JSON.stringify(data));
    }
    //xhr functions
    var ajaxGet = function (urlSuffix, callback) {
        var callback = (typeof callback == 'function' ? callback : false);
        var xhr = new XMLHttpRequest();
        xhr.timeout = 120000; // time in milliseconds
        xhr.open("GET", serverUrl+urlSuffix);
        xhr.onreadystatechange=function() {
            if (xhr.readyState==4 && callback) {
                callback(xhr.responseText)
            }
        }
        xhr.send();
        return xhr;
    }
    var ajaxDelete = function (urlSuffix, callback) {
        var callback = (typeof callback == 'function' ? callback : false);
        var xhr = new XMLHttpRequest();
        xhr.timeout = 120000; // time in milliseconds
        xhr.open("DELETE", serverUrl+urlSuffix);
        xhr.onreadystatechange=function() {
            if (xhr.readyState==4 && callback) {
                callback(xhr.responseText)
            }
        }
        xhr.send();
        return xhr;
    }
    var ajaxPost = function (urlSuffix, data, callback) {
        var callback = (typeof callback == 'function' ? callback : false);
        var xhr = new XMLHttpRequest();
        xhr.timeout = 120000; // time in milliseconds
        xhr.open("POST", serverUrl+urlSuffix);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange=function() {
            if (xhr.readyState==4 && callback) {
                callback(xhr.responseText)
            }
        }
        xhr.send(JSON.stringify(data));
        return xhr;
    }

    //return the relevent from this object
    return {
        isAnon: isAnon,
        user: user,
        counter: counter,
        register: register,
        getMessages: getMessages,
        postMessage: postMessage,
        deleteMessage: deleteMessage,
        getStats: getStats,
        enter: enter, 
        exit: exit,
        reEnter: reEnter
    };
})();