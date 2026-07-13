let roomPassword = "KEY";
let username = "";
let roomCode = "";
let socket;

document.getElementById("joinButton").onclick = function(){
    username = document.getElementById("username").value;
    roomCode = document.getElementById("roomCode").value;
    let password = document.getElementById("password").value;

    if(username === ""){ alert("Enter username"); return; }
    if(roomCode === ""){ alert("Enter room code"); return; }
    if(password !== roomPassword){ alert("Wrong password"); return; }

    document.getElementById("join").style.display = "none";
    document.getElementById("chat").style.display = "block";
    document.getElementById("roomDisplay").innerHTML = "Room: " + roomCode;

    connectServer();
};

function connectServer(){
    socket = new WebSocket("wss://private-chat-wnxf.onrender.com");

    socket.onopen = function(){
        console.log("Connected to Chat Server");
        socket.send(JSON.stringify({
            type:"join",
            room:roomCode,
            username: username
        }));
    };

    socket.onmessage = function(event){
        let data = JSON.parse(event.data);

        if(data.type === "message"){
            // FIX: Only print if the message belongs to someone else
            if(data.user !== username) {
                let message = document.createElement("p");
                message.innerHTML = "<b>" + data.user + ":</b> " + data.text;
                document.getElementById("messages").appendChild(message);
                document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
            }
        }
if(data.type === "image"){
            // Only print if the image belongs to someone else
            if(data.user !== username) {
                let imgContainer = document.createElement("p");
                imgContainer.innerHTML = "<b>" + data.user + ":</b><br><img src='" + data.image + "' style='max-width: 100%; border-radius: 8px; margin-top: 5px;'>";
                document.getElementById("messages").appendChild(imgContainer);
                document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
            }
        }
        if(data.type === "closed"){
            alert(data.message);
            location.reload();
        }
    };
}

document.getElementById("sendButton").onclick = function(){
    let text = document.getElementById("text").value;
    if(text === ""){ return; }

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
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
};
// Listen for image uploads
document.getElementById("image").addEventListener("change", function(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        let base64Image = e.target.result;

        // Send the image string to the server
        socket.send(JSON.stringify({
            type: "image",
            user: username,
            room: roomCode, 
            image: base64Image
        }));

        // Display it instantly for the sender
        let imgContainer = document.createElement("p");
        imgContainer.innerHTML = "<b>You:</b><br><img src='" + base64Image + "' style='max-width: 100%; border-radius: 8px; margin-top: 5px;'>";
        document.getElementById("messages").appendChild(imgContainer);
        document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;

        // Clear the input so they can send another later
        document.getElementById("image").value = ""; 
    };
    reader.readAsDataURL(file); // Converts the file to a base64 string
});