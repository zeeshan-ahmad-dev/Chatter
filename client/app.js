import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

socket.on("connect", () => {
    console.log(socket.id);
})

const toggleBtn1 = document.querySelector('.toggle');
const toggleBtn2 = document.querySelector('.toggle2');
const contactSection = document.querySelector('.contacts');
const contactContainer = document.querySelector('.contact-container');
const chatBody = document.querySelector('.chat-body');
const joinBtn = document.querySelector('.join-btn');
const roomInput = document.querySelector('.join');
const createBtn = document.querySelector('.create-btn');
const nameInput = document.querySelector('.nameInput');
const sendBtn = document.querySelector('.send-btn');
const messageInput = document.querySelector('.messageInput');
const inputContainer = document.querySelector('.input-container');
const createRoomContainer = document.querySelector('.create-room');
const roomNameContainer = document.querySelector('.roomName');
const nameContainer = document.querySelector('.userName');
let currentRoom = 'Global Room';
let username;

toggleBtn1.addEventListener('click', () => contactSection.classList.toggle('active'));
toggleBtn2.addEventListener('click', () => contactSection.classList.toggle('active'));

// Create room to set name
createBtn.addEventListener('click', () => {
    if (nameInput.value.trim() === '') return;

    username = nameInput.value.trim();
    nameContainer.innerText = username;
    inputContainer.classList.remove('nothing');
    chatBody.classList.remove('nothing');
    createRoom("Global Room");
    fetchMessages("Global Room");
    scrollToBottom();

    socket.emit('join-room', 'Global Room', username);
    createRoomContainer.style.display = 'none';
})

// join Button 
joinBtn.addEventListener('click', () => {
    if (roomInput.value.trim() === '') return;
    const roomname = roomInput.value.trim();

    inputContainer.classList.remove('nothing');
    chatBody.classList.remove('nothing');
    createRoom(roomname);

    createRoomContainer.style.display = 'none';

    // Accessing contacts
    
    contactContainer.addEventListener('click', (event) => {
        const contactElement = event.target.closest('.contact');
        if (!contactElement) return;
        
        const contacts = document.querySelectorAll('.contact');
        contacts.forEach((e) => e.classList.remove('activeContact'));

        contactElement.classList.add('activeContact');

        const roomName = contactElement.querySelector('h3').textContent;
        if (currentRoom !== roomName) {
            fetchMessages(roomName);
            currentRoom = roomName;
            roomNameContainer.innerText = currentRoom;
            socket.emit('join-room', currentRoom, username);
        }
    })
    roomInput.value = '';
})

sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message == '') return;
    const time = getDate();

    socket.emit("send-message", message, username, currentRoom, time);
    displaySenderMessage(message, username, time);
    if (currentRoom == 'Global Room') sendMessagesToAPI(message, username, currentRoom, time);
    messageInput.value = '';
    scrollToBottom();
})

function displayjoinedMessage(room, name) {
    const div = document.createElement('div');
    div.classList.add('joined');
    div.innerText = `${name} has joined ${room}`;
    chatBody.appendChild(div);
}

function createRoom(userName) {
    const div = document.createElement('div');
    div.classList.add('contact');
    div.innerHTML = `
    <div class="contact-left">
        <img src="./imgs/pfp.jpeg" alt="">
        <div class="name-msg">
            <h3>${userName}</h3>
        </div>
        </div>
        <div class="contact-right"><span>10:00PM</span></div>`;
    contactContainer.appendChild(div);
    nameInput.value = '';
}

function sendMessagesToAPI(message, name, room) {
    const encodedRoom = encodeURIComponent(room || 'Global Room');
    const apiURL = `http://localhost:3005/${encodedRoom}`;
    const date = getDate();

    fetch(apiURL, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ sender: name, message, time: date })
    })
        .catch(error => console.error("Error sending message to API:", error));
}

function displayRecieverMessage(message, name, time) {
    const div = document.createElement("div");
    div.innerHTML = `<div class="message reciever">
    <span class='messengerName'>${name}</span>
    <span class='messageText'>${message}</span>
    <span class='messageTime'>${time}</span>
    </div>`;
    chatBody.appendChild(div);
}

function displaySenderMessage(message, name, time) {
    const div = document.createElement("div");
    div.innerHTML = `<div class="message sender">
        <span class='messengerName'>${name}</span>
        <span class='messageText'>${message}</span>
            <span class='messageTime'>${time}</span>
    </div>`;
    chatBody.appendChild(div);
}

function fetchMessages(room = '') {
    chatBody.innerHTML = '';
    if (room == '') return;
    const encodedRoom = encodeURIComponent(room);
    fetch(`http://localhost:3005/${encodedRoom}`, {
        method: "GET"
    })
        .then(res => res.json())
        .then(data => {
            data.forEach(item => {
                if (username === item.sender) {
                    displaySenderMessage(item.message, item.sender, item.time);
                } else {
                    displayRecieverMessage(item.message, item.sender, item.time);
                }
            });
        })
}

function getDate() {
    const date = new Date();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
}

function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Recieve message
socket.on('recieve-message', (message, name, time) => {
    displayRecieverMessage(message, name, time);
    scrollToBottom();
})
// Join Message
socket.on('join-message', (room, name) => {
    displayjoinedMessage(room, name);
})