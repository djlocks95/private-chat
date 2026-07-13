let socket;


function login(){


socket = new WebSocket(
"wss://YOUR-RENDER-URL.onrender.com"
);



socket.onopen=function(){


socket.send(JSON.stringify({

type:"admin",

password:
document.getElementById("password").value


}));



};



socket.onmessage=function(event){


let data =
JSON.parse(event.data);



if(data.type==="rooms"){


let box =
document.getElementById("rooms");


box.innerHTML="";


data.rooms.forEach(room=>{


let div =
document.createElement("div");



div.innerHTML =
`
<b>${room}</b>

<button onclick="closeRoom('${room}')">
Close
</button>

`;



box.appendChild(div);


});



}


};


}




function closeRoom(room){


socket.send(JSON.stringify({

type:"closeRoom",

room:room


}));


}