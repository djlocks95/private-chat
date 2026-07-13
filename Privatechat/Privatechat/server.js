const WebSocket = require("ws");

const server = new WebSocket.Server({
    port: 3000
});

let rooms = {};

console.log("Server running on port 3000");


server.on("connection", socket => {

    socket.on("message", data => {

        let msg = JSON.parse(data);


        // When someone joins a room
        if (msg.type === "join") {

            socket.room = msg.room;


            if (!rooms[msg.room]) {
                rooms[msg.room] = [];
            }


            rooms[msg.room].push(socket);


            console.log("User joined room:", msg.room);

        }


        // Send messages to others in the same room
        if (msg.type === "message") {

            if (rooms[socket.room]) {

                rooms[socket.room].forEach(client => {

                    if (client !== socket) {

                        client.send(JSON.stringify(msg));

                    }

                });

            }

        }


    });


    socket.on("close", () => {

        if (socket.room && rooms[socket.room]) {

            rooms[socket.room] =
            rooms[socket.room].filter(
                client => client !== socket
            );

        }

    });


});