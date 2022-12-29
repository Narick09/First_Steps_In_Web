const socket = io.connect();

const chatField = document.querySelector(".chat");
const nameInput = document.querySelector(".name-input");
const mesInput = document.querySelector(".message-input");
const buttonSend = document.querySelector(".but-send");
const usersList = document.querySelector(".users-list");
let myName = localStorage.getItem("myName");
let id = localStorage.getItem("id");
let lastMes = localStorage.getItem("lastMes");
nameInput.value = myName;
mesInput.value = lastMes;
socket.on('userConnected', (data) => {
    
    id = data;
    localStorage.setItem("id", id);
    console.log('A user connected: ', id, myName);
});

socket.on('userDisconnected', (data) => {
    const div = document.createElement("div");
    div.className = "chat-info";
    div.innerHTML = `${data} отсоединился\n`;
    chatField.append(div);
});

socket.on('addMes', (data) => {
    const div = document.createElement("div");
    div.className = "chat-info";
    div.innerHTML = `${data.name}: ${data.message} \n`;
    chatField.append(div);
    console.log("name:", myName, data.message);
    if(data.message.includes(myName)){
        const audio = new Audio("ding.mp3");
        if(audio) {
            console.log(audio);
            audio.play();
        }
    } else {
        console.log('nema');
    }
});

socket.on('addUser', (token, data) => {
    const div = document.createElement("div");
    div.className = "chat-info";
    if(myName) {
        div.innerHTML = myName + " присоединился";
        socket.emit('changedName', myName);
    } else {
        div.innerHTML = `${data}  присоединился\n`;
    }
    chatField.append(div);

    const li = document.createElement("li");
    li.className = "el-user-list " + token;
    li.innerHTML = data;
    usersList.append(li);
});

socket.on('delUser', (token) => {
    usersList.querySelector("." + token).remove();
});

socket.on('updateName', (token, name) => {
    usersList.querySelector("." + token).innerHTML = name;
    //myName = name;
});

nameInput.addEventListener('input', (event) => {
    console.log(event.target.value); 
    socket.emit('changedName', event.target.value);
    myName = event.target.value;
    localStorage.setItem("myName", myName);
});
mesInput.addEventListener('input', (event) => {
    lastMes = event.target.value;
    localStorage.setItem("lastMes", lastMes);
});
buttonSend.addEventListener("click", (event) => {
    if(nameInput.value && mesInput.value){
        socket.emit('sendMes', {name: nameInput.value, message: mesInput.value});
        const div = document.createElement("div");
        div.className = "chat-info";
        div.innerHTML = `${nameInput.value}: ${mesInput.value} \n`;
    } else {
        if(nameInput.value) {
            alert('Enter name!');
        } else {
            alert('Enter message!');
        }
    }
});