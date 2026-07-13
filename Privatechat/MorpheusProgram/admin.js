let socket;

function login(){
    socket = new WebSocket("wss://private-chat-wnxf.onrender.com");

    socket.onopen = function(){
        console.log("Connected");
        socket.send(JSON.stringify({
            type:"admin",
            password: document.getElementById("password").value
        }));
    };

    socket.onmessage = function(event){
        let data = JSON.parse(event.data);
        console.log(data);

        if(data.type === "adminLogin"){
            alert("Admin Login Successful");
            document.getElementById("loginContainer").style.display = "none";
            document.getElementById("dashboard").style.display = "flex";
            showRooms(data.rooms);
        }

        if(data.type === "rooms"){
            showRooms(data.rooms);
        }

if(data.type === "adminMessage" || data.type === "adminImage"){
            let mainBox = document.getElementById("messages");
            let roomDiv = Array.from(mainBox.children).find(child => child.getAttribute("data-room-name") === data.room);
            
            if(roomDiv){
                let messagesContainer = roomDiv.querySelector(".room-messages");
                let p = document.createElement("p");
                p.style.margin = "5px 0";
                
                // Render differently based on text or image
                if (data.type === "adminImage") {
                    p.innerHTML = "<b>" + data.user + ":</b><br><img src='" + data.image + "' style='max-width: 100%; border-radius: 8px; margin-top: 5px;'>";
                } else {
                    p.innerHTML = "<b>" + data.user + ":</b> " + data.text;
                }
                
                messagesContainer.appendChild(p);
                roomDiv.scrollTop = roomDiv.scrollHeight;
            }
        }
function showRooms(rooms){
    let leftBox = document.getElementById("rooms");
    let mainBox = document.getElementById("messages");

    leftBox.innerHTML = "";

    if(rooms.length === 0){
        leftBox.innerHTML = "<p>No active rooms</p>";
        document.getElementById("currentRoom").innerText = "No Active Rooms";
        mainBox.innerHTML = ""; 
        return;
    }

    document.getElementById("currentRoom").innerText = "Live Monitoring Panel (All Active Chats)";

    // Render control sidebar loops
    rooms.forEach(room => {
        let div = document.createElement("div");
        div.innerHTML = `
        <h3>Room: ${room}</h3>
        <button onclick="closeRoom('${room}')">Close Room</button>
        <hr>
        `;
        leftBox.appendChild(div);
    });

    // Remove text feeds for channels that were closed
    let existingRoomDivs = mainBox.querySelectorAll(".admin-room-chat");
    existingRoomDivs.forEach(div => {
        let roomName = div.getAttribute("data-room-name");
        if (!rooms.includes(roomName)) {
            div.remove();
        }
    });

    // Append clean viewport spaces for fresh, new streams
    rooms.forEach(room => {
        let div = Array.from(mainBox.children).find(child => child.getAttribute("data-room-name") === room);
        
        if (!div) {
            div = document.createElement("div");
            div.className = "admin-room-chat";
            div.setAttribute("data-room-name", room);
            
            div.style.border = "1px solid #444";
            div.style.marginBottom = "15px";
            div.style.padding = "12px";
            div.style.background = "#161616";
            div.style.maxHeight = "250px";
            div.style.overflowY = "auto";
            div.style.borderRadius = "6px";
            
            div.innerHTML = `
                <h4 style="margin: 0 0 10px 0; color: #00ffcc; border-bottom: 1px solid #333; padding-bottom: 5px;">
                    🟢 Active Feed — Room: ${room}
                </h4>
                <div class="room-messages"></div>
            `;
            mainBox.appendChild(div);
        }
    });
}

function closeRoom(room){
    socket.send(JSON.stringify({
        type:"closeRoom",
        room:room
    }));
}