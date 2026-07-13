let socket;

function login(){
    socket = new WebSocket("wss://private-chat-wnxf.onrender.com");

    socket.onopen = function(){
        socket.send(JSON.stringify({
            type:"admin",
            password: document.getElementById("password").value
        }));
    };

    socket.onmessage = function(event){
        let data = JSON.parse(event.data);

        if(data.type === "adminLogin"){
            alert("Admin Login Successful");
            document.getElementById("loginContainer").style.display = "none";
            document.getElementById("dashboard").style.display = "flex";
            showRooms(data.rooms);
        }
        
        if(data.type === "adminLoginFailure"){
            alert(data.message);
        }

        if(data.type === "rooms"){
            showRooms(data.rooms);
        }

        if(data.type === "adminMessage" || data.type === "adminImage"){
            // 🟢 UPDATED: Look for the new adminMessages ID
            let mainBox = document.getElementById("adminMessages");
            let roomDiv = Array.from(mainBox.children).find(child => child.getAttribute("data-room-name") === data.room);
            
            if(roomDiv){
                let messagesContainer = roomDiv.querySelector(".room-messages");
                let p = document.createElement("p");
                p.style.margin = "5px 0";
                
                if (data.type === "adminImage") {
                    p.innerHTML = "<b>" + data.user + ":</b><br><img src='" + data.image + "' style='max-width: 100%; border-radius: 8px; margin-top: 5px;'>";
                } else {
                    p.innerHTML = "<b>" + data.user + ":</b> " + data.text;
                }
                
                messagesContainer.appendChild(p);
                roomDiv.scrollTop = roomDiv.scrollHeight;
            }
        }
    };
}

function showRooms(rooms){
    let leftBox = document.getElementById("rooms");
    let mainBox = document.getElementById("adminMessages");

    leftBox.innerHTML = "";

    if(rooms.length === 0){
        leftBox.innerHTML = "<p>No active rooms</p>";
        document.getElementById("currentRoom").innerText = "No Active Rooms";
        mainBox.innerHTML = ""; 
        return;
    }

    document.getElementById("currentRoom").innerText = "Live Monitoring Panel";

    rooms.forEach(room => {
        let div = document.createElement("div");
        div.innerHTML = `<h3>Room: ${room}</h3><button onclick="closeRoom('${room}')">Close Room</button><hr>`;
        leftBox.appendChild(div);
    });

    let existingRoomDivs = mainBox.querySelectorAll(".admin-room-chat");
    existingRoomDivs.forEach(div => {
        let roomName = div.getAttribute("data-room-name");
        if (!rooms.includes(roomName)) div.remove();
    });

    rooms.forEach(room => {
        let div = Array.from(mainBox.children).find(child => child.getAttribute("data-room-name") === room);
        
        if (!div) {
            div = document.createElement("div");
            div.className = "admin-room-chat";
            div.setAttribute("data-room-name", room);
            
            // 🟢 UPDATED: Max-height 600px allows for much more vertical space per room!
            div.style.cssText = "border: 1px solid #444; margin-bottom: 20px; padding: 15px; background: #161616; max-height: 600px; overflow-y: auto; border-radius: 6px;";
            
            div.innerHTML = `
                <h4 style="margin: 0 0 10px 0; color: #00ffcc; border-bottom: 1px solid #333; padding-bottom: 5px;">
                    🟢 Room: ${room}
                </h4>
                <div class="room-messages"></div>
            `;
            mainBox.appendChild(div);
        }
    });
}

function closeRoom(room){
    socket.send(JSON.stringify({ type:"closeRoom", room:room }));
}