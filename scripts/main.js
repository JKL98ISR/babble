let Babble = window.Babble;

function incTabCounter(){
    if(!localStorage)
        return 1;
    var data=JSON.parse(localStorage.getItem("babble"));
    var tabsCounter=parseInt(data.tabsCounter)+1;
    console.log("tabs0 "+data.tabsCounter);
    data.tabsCounter=tabsCounter;
    console.log("tabs "+tabsCounter);
    localStorage.setItem('babble', JSON.stringify(data));
    return tabsCounter;
}
function decTabCounter(){
    if(!localStorage)
        return 0;
    var data=JSON.parse(localStorage.getItem("babble"));
    var tabsCounter=parseInt(data.tabsCounter)-1;
    data.tabsCounter=tabsCounter;
    localStorage.setItem('babble', JSON.stringify(data));
    return tabsCounter;
}
function updateTheCurrMsg(){
    if(!localStorage)
        return;
    var data=JSON.parse(localStorage.getItem("babble"));
    data.currentMessage=document.getElementById("textMsg").value;
    localStorage.setItem('babble', JSON.stringify(data));
}
function updateToCurrMsg(){
    if(!localStorage)
        return;
    var data=JSON.parse(localStorage.getItem("babble"));
    document.getElementById("textMsg").value=data.currentMessage;
}
//check if the user is registred in another tab
function checkIfRegistred(){
    if(!localStorage)
        return;
    var data=JSON.parse(localStorage.getItem("babble"));
    if(data.userInfo.name && data.userInfo.email){
        Babble.isAnon=false;
        Babble.user.name = data.userInfo.name;
        Babble.user.email = data.userInfo.email;
    }    
}
function login(){
    var user={};
    user.name=document.getElementById("rUsr").value;
    user.email=document.getElementById("rEmail").value;
    if(user.name && user.email){
        Babble.register(user);
        deleteLogin();
    }
}
function deleteLogin(){
    document.getElementById("loginModal").remove();
}
function changeMsgList() {
    var msgList=document.getElementById("MsgContainer");
    msgList.style.height ="calc(100% - "+ document.getElementById("textMsg").clientHeight+"px)";
}
function makeGrowable(container) {
    var area = container.querySelector('textarea');
    var clone = container.querySelector('span');
    clone.textContent = area.value;
    function resize(e) {
        clone.textContent = area.value;
    };
    area.addEventListener('input', resize);
}
function sendMsg(){
    var yourMsg=document.getElementById("textMsg");
    var theMsg=yourMsg.value;
    if(!theMsg.trim())
        return false;

    if(Babble.isAnon)
        checkIfRegistred();   

    yourMsg.value="";
    var span=document.querySelector(".userText").querySelector('span');
    span.textContent="";
    changeMsgList();

    var message = {
        name: Babble.user.name,
        email: Babble.user.email,
        message: theMsg,
        timestamp: Date.now()
    };
    Babble.postMessage(message);
    return false;
}
function printMsg(msg){
    /*if(document.getElementById(msg.id))
        return;*/
    if(msg.id == undefined)
        return;
    console.log(msg);
    var theMsg=msg.message;
    var msgL=document.createElement("il");
    msgL.id=msg.id;
    var dateObj=new Date(msg.timestamp);
    var img=document.createElement("img");
    if(msg.img)
        img.src=msg.img;
    else
        img.src="images/anon.png";
    img.alt="";
    img.className="usr-img";
    msgL.appendChild(img);
    var topBar=document.createElement("div"); 
    topBar.className="msgText";
    topBar.tabIndex="1";
    var userName=document.createElement("cite");
    userName.innerHTML=msg.name;
    topBar.appendChild(userName);
    var date=document.createElement("time");
    date.innerHTML=dateObj.toLocaleString();
    date.setAttribute("dateTime", dateObj.getTime());
    topBar.appendChild(date);
    var canDelete=msg.email && msg.email==Babble.user.email;
    var deleteB=document.createElement("button");
    if(canDelete){
        deleteB.setAttribute("aria-label", "Delete Message");
        deleteB.innerHTML="x";
        deleteB.tabIndex="1";
        deleteB.onclick=function (e) {
            Babble.deleteMessage(msgL.id);
            msgL.remove();
        };
    } else {
        deleteB.innerHTML=" ";
    }
    topBar.appendChild(deleteB);
    var textDiv=document.createElement("div");
    var textPre=document.createElement("pre");
    var textSpan=document.createElement("span");
    textSpan.textContent=theMsg;
    textPre.appendChild(textSpan);
    textPre.appendChild(document.createElement("br"));
    textDiv.appendChild(textPre);
    textDiv.className="Growable";
    topBar.appendChild(textDiv);
    msgL.appendChild(topBar);
    msgL.className="usr-msg";
    document.getElementById("MsgContainer").appendChild(msgL);
}

function parseAndPrintMsg(response){
    if(!response)
        return;
    var msgArr=response;
    var msgLen = msgArr.length;
    if(msgLen)
        console.log(msgLen);
    Babble.counter+=msgLen;
    for (i = 0; i < msgLen; i++) {
       printMsg(msgArr[i]);
    }
}
function parseMsgAndPoll(response){
    parseAndPrintMsg(response);
    pollMsg();
}
//poll messages
function pollMsg(){
    console.log("msg poll");
    Babble.getMessages(Babble.counter, parseMsgAndPoll);
}
pollMsg();

function parseAndUpdateStats(response){
    if(!response)
        return;
    var stats=response;
    var currMsg=document.getElementById("msgAmount").innerHTML;
    if(currMsg!=stats.messages)
        document.getElementById("msgAmount").innerHTML=stats.messages;
    var currUsers=document.getElementById("users").innerHTML;
    if(currUsers!=stats.users)
        document.getElementById("users").innerHTML=stats.users;
}
function parseStatsAndPoll(response){
    parseAndUpdateStats(response);
    pollStats();
}
//poll stats
function pollStats(){
    console.log("satas poll");
    Babble.getStats(parseStatsAndPoll);
}

pollStats();

if(incTabCounter()==1){
    setTimeout(Babble.enter, 100);
} else{
    setTimeout(Babble.reEnter, 100);
} 

//on load / on unload
document.addEventListener("DOMContentLoaded", function(event) { 
    checkIfRegistred();
    if(!Babble.isAnon)
        deleteLogin();       
    updateToCurrMsg();
    makeGrowable(document.querySelector(".userText")); 
    var userTextMsg=document.getElementById("textMsg"); 
    userTextMsg.addEventListener('input', changeMsgList);
    window.onresize = changeMsgList;
    setTimeout(changeMsgList, 10);
});
window.onbeforeunload = function(e){
    if(decTabCounter()==0)
        Babble.exit();      
    updateTheCurrMsg();
}