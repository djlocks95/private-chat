let socket;


function login(){

    socket = new WebSocket(
        "wss://private-chat-wnxf.onrender.com"
    );


    socket.onopen = function(){

        console.log("Connected");

        socket.send(JSON.stringify({

            type:"admin",

            password:
            document.getElementById("password").value

        }));

    };


    socket.onmessage = function(event){

        let data = JSON.parse(event.data);


        console.log(data);



        if(data.type === "adminLogin"){

            alert("Admin Login Successful");

            showRooms(data.rooms);

        }



        if(data.type === "rooms"){

            showRooms(data.rooms);

        }


    };


}




function showRooms(rooms){

    let box =
    document.getElementById("rooms");


    box.innerHTML = "";


    if(rooms.length === 0){

        box.innerHTML =
        "<p>No active rooms</p>";

        return;

    }



    rooms.forEach(room=>{


        let div =
        document.createElement("div");


        div.innerHTML = `

        <h3>
        Room: ${room}
        </h3>

        <button onclick="closeRoom('${room}')">
        Close Room
        </button>

        <hr>

        `;


        box.appendChild(div);


    });


}





function closeRoom(room){


    socket.send(JSON.stringify({

        type:"closeRoom",

        room:room

    }));


}