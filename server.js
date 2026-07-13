const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("public"));
const WebSocket = require("ws");

// 🟢 CRITICAL FIX: Dynamic port allocation for Render
const PORT = process.env.PORT || 3000;
const httpServer = app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

const server = new WebSocket.Server({ server: httpServer });

let rooms = {};
let admins = [];

server.on("connection", socket => {
    socket.on("message", data => {
        let msg = JSON.parse(data);

        // USER JOINS ROOM
        if(msg.type === "join"){
            socket.username = msg.username;
            socket.room = msg.room;

            if(!rooms[msg.room]){ rooms[msg.room] = []; }
            rooms[msg.room].push(socket);
            console.log(socket.username + " joined " + msg.room);
            sendAdminUpdate();
        }

        // NORMAL CHAT MESSAGE
        if(msg.type === "message"){
            if(rooms[socket.room]){
                rooms[socket.room].forEach(client =>{
                    client.send(JSON.stringify({
                        type:"message",
                        user:socket.username,
                        text:msg.text
                    }));
                });

                admins.forEach(admin => {
                    if (admin.readyState === WebSocket.OPEN) {
                        admin.send(JSON.stringify({
                            type:"adminMessage",
                            room:socket.room,
                            user:socket.username,
                            text:msg.text
                        }));
                    }
                });
            }
        }

        // ADMIN LOGIN
        if(msg.type === "admin"){
            if(msg.password === "ADMIN123"){
                socket.isAdmin = true;
                admins.push(socket);

                socket.send(JSON.stringify({
                    type:"adminLogin",
                    rooms:Object.keys(rooms)
                }));
                console.log("Admin connected successfully");
            } else {
                // 🟢 CRITICAL FIX: Alert the admin if the password is wrong
                socket.send(JSON.stringify({
                    type: "adminLoginFailure",
                    message: "Invalid Admin Password! Access Denied."
                }));
            }
        }

        // ADMIN CLOSE ROOM
        if(msg.type === "closeRoom"){
            let room = msg.room;
            if(rooms[room]){
                rooms[room].forEach(client =>{
                    client.send(JSON.stringify({
                        type:"closed",
                        message:"Room closed by admin"
                    }));
                    client.close();
                });
                delete rooms[room];
                sendAdminUpdate();
            }
        }
    });

    socket.on("close", () => {
        if (socket.isAdmin) {
            admins = admins.filter(a => a !== socket);
        }

        if(socket.room && rooms[socket.room]){
            rooms[socket.room] = rooms[socket.room].filter(c => c !== socket);
            if(rooms[socket.room].length === 0){
                delete rooms[socket.room];
            }
            sendAdminUpdate();
        }
    });
});

function sendAdminUpdate(){
    admins.forEach(admin => {
        if (admin.readyState === WebSocket.OPEN) {
            admin.send(JSON.stringify({
                type:"rooms",
                rooms:Object.keys(rooms)
            }));
        }
    });
}