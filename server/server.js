const io = require("socket.io")(3001, {
    cors: {
        origin: ["https://8643-37-111-179-142.ngrok-free.app/"]
    }
})


io.on("connection", (socket) => {
    console.log("connected to ", socket.id)
    socket.on('send-message', (message, name, room, time) => {
        console.log(message)
        if (room == '') {
            socket.broadcast.emit('recieve-message', message, name, time)
        } else {
            console.log('else ', room)
            socket.to(room).emit('recieve-message', message, name, time)
        }
    })
    socket.on('join-room', (room, name) => {
        socket.join(room)
        socket.to(room).emit('join-message', room, name)
    })
})
