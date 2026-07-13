let roomPassword = "KEY";

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

    document.getElementById("roomDisplay").innerHTML = "Room: " + roomCode;

    connectServer();
};

function connectServer(){
    // FIX 1: Changed "wws://" to "wss://" so Netlify and modern browsers don't block the connection
    socket = new WebSocket(
        "wss://private-chat-wnxf.onrender.com"
    );

    socket.onopen = function(){
        console.log("Connected to Chat Server");

        // FIX 2: Added 'username' here so the server knows who is sending messages
        socket.send(JSON.stringify({
            type:"join",
            room:roomCode,
            username: username
        }));
    };

    socket.onmessage = function(event){
        let data = JSON.parse(event.data);

        // Only render normal chat messages
        if(data.type === "message"){
            let message = document.createElement("p");
            message.innerHTML = "<b>" + data.user + ":</b> " + data.text;
            document.getElementById("messages").appendChild(message);
            
            // Auto-scroll user window to latest message
            document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
        }

        // Gracefully handle if the admin forcefully terminates this room
        if(data.type === "closed"){
            alert(data.message);
            location.reload();
        }
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
    ownMessage.innerHTML = "<b>You:</b> " + text;
    document.getElementById("messages").appendChild(ownMessage);

    document.getElementById("text").value="";
    
    // Auto-scroll user window to latest message
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
};