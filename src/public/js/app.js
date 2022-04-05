const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;

  const msgForm = room.querySelector('#msg');
  const nameForm = room.querySelector('#name');
  msgForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = room.querySelector('#msg input');
    const value = input.value;
    socket.emit('new_message', input.value, roomName, () => {
      addMessage(`You: ${value}`);
    });
    input.value = '';
  });
  nameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = room.querySelector('#name input');
    socket.emit('nickname', input.value);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = form.querySelector('input');
  socket.emit('enter_room', input.value, showRoom); // socket.send() 와 동일한 의미. 항상 메세지를 보낼 필요는 없고 이벤트를 보낼수도 있음
  roomName = input.value;
  input.value = '';
});

socket.on('welcome', (user) => {
  addMessage(`${user} arrived`);
});

socket.on('bye', (left) => {
  addMessage(`${left} left ㅠㅠ`);
});

socket.on('new_message', addMessage);

// // app.js가 수정될 때마다 nodemon이 새롭게 시작되는 것이 아니라
// // server 혹은 views가 수정되었을 때 재시작되도록 하고 싶다.

// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");
// const socket = new WebSocket(`ws://${window.location.host}`);

// // JSON object를 string으로 만들어주는 함수
// function makeMessage(type, payload){
//     const msg = {type, payload};
//     return JSON.stringify(msg);
// }

// socket.addEventListener("open", () => {
//     console.log("Connected to Server ✅");
// });

// socket.addEventListener("message", (message) => {
//     // console.log("New message: ", message.data);
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
// });

// socket.addEventListener("close", () => {
//     console.log("Disconnected from Server ❌");
// });

// messageForm.addEventListener("submit", (event) => {
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     socket.send(makeMessage("new_message", input.value)); // 서버로 전송
//     input.value = "";
// });

// nickForm.addEventListener("submit", (event) => {
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMessage("nickname", input.value));
//     input.value = "";
// })

// // setTimeout(() => {
// //     socket.send("hello from the browser!");
// // }, 10000);
