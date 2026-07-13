let roomPassword = "1234";

let username = "";
let roomCode = "";

let socket;


document.getElementById("joinButton").onclick = function(){

    username = document.getElementById("username").value;

    roomCode = document.getElementById("roomCode").value;

    let password = document.getElementById("password").value;


    if(username === ""){
        alert("Enter username");
        return;
    }


    if(roomCode === ""){
        alert("Enter room code");
        return;
    }


    if(password !== roomPassword){
        alert("Wrong password");
        return;
    }


    document.getElementById("join").style.display = "none";

    document.getElementById("chat").style.display = "block";


    document.getElementById("roomDisplay").innerHTML =
    "Room: " + roomCode;


    connectServer();

};





function connectServer(){

    socket = new WebSocket(
        "https://private-chat-wnxf.onrender.com"
    );


    socket.onopen = function(){

        console.log("Connected");


        socket.send(JSON.stringify({

            type:"join",

            room:roomCode

        }));

    };



    socket.onmessage = function(event){

        let data = JSON.parse(event.data);


        let message = document.createElement("p");


        message.innerHTML =
        "<b>" + data.user + ":</b> " + data.text;


        document.getElementById("messages")
        .appendChild(message);

    };


}






document.getElementById("sendButton").onclick = function(){

    let text = document.getElementById("text").value;


    if(text === ""){
        return;
    }



    let message = {

        type:"message",

        user:username,

        text:text

    };


    socket.send(JSON.stringify(message));



    let ownMessage = document.createElement("p");


    ownMessage.innerHTML =
    "<b>You:</b> " + text;


    document.getElementById("messages")
    .appendChild(ownMessage);



    document.getElementById("text").value="";


};