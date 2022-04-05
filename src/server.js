import http from 'http';
// import WebSocket from "ws";
import SocketIo from 'socket.io';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views'); // 템플릿 지정

app.use('/public', express.static(__dirname + '/public')); // static. url에 public을 입력했을 때 경로 지정.
app.get('/', (req, res) => res.render('home')); // home 렌더하는 route handler
app.get('/*', (req, res) => res.redirect('/')); // 어떤 url을 입력하더라도 home으로 가도록 함.

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// app.listen(3000, handleListen);

const httpServer = http.createServer(app); // app 으로부터 서버 생성 access
const wsServer = SocketIo(httpServer); // socket.Io로 서버 생성

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anonymous';
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    console.log(socket.id);
    done(); // frontend
    socket.to(roomName).emit('welcome', socket.nickname); // 룸에 들어온 사람들에게 환영 이벤트.
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname)
    );
  });

  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname} : ${msg}`);
    done();

    socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
  });
});

// const wss = new WebSocket.Server({ server }); // 웹소켓 서버 생성
// 같은 서버에서 http, websocket 서버 모두 작동
// ws 서버만 만들어도 상관 없음. (다른 것이 필요 없다면)

// 서버에 연결되면 연결을 담을 배열
// const sockets = [];

// wss.on("connection", (socket)=>{
//     sockets.push(socket); // 배열에 연결된 소켓 추가
//     socket["nickname"] = "Anon"; // 기본 닉네임을 익명으로 설정
//     console.log("Connected to Browser ✅"); // 브라우저 연결 시
//     socket.on("close", () => console.log("Disconnected from Browser ❌")); // 브라우저가 꺼졌을 때
//     socket.on("message", (msg) => {
//         // console.log(message.toString());
//         const message = JSON.parse(msg);
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(`${socket.nickname} : ${message.pa}`)); break;
//             case "nickname":
//                  socket["nickname"] = message.payload;
//                  break;

//         }
//         // JSON object를 string으로 변환
//     });
//     // socket.send("hello!");
// });

// server.listen(3000, handleListen);
httpServer.listen(3000, handleListen);
