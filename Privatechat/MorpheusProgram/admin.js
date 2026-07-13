let socket;


function login(){

    console.log("Login button clicked");


    socket = new WebSocket(
        "https://private-chat-wnxf.onrender.com"
    );


    socket.onopen = function(){

        console.log("Connected to server");


        socket.send(JSON.stringify({

            type:"admin",

            password:
            document.getElementById("password").value

        }));

    };


    socket.onmessage = function(event){

        console.log(event.data);


        let data = JSON.parse(event.data);


        if(data.type === "adminLogin"){

            alert("Admin Login Successful");

        }


    };


    socket.onerror = function(error){

        console.log("WebSocket error:", error);

    };


}