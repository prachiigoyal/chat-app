const path=require('path')
const express=require('express')
const http=require('http')
const mongoose=require('mongoose')
const socketio=require('socket.io')
const Filter=require('bad-words')
const Message=require('./models/message')
const { generateMessage,generateLocationMessage }=require('./utils/messages')
const { addUsers,removeUser,getUser,getUsersInRoom}=require('./utils/users')
const { assert } = require('console')

const app=express()
const server=http.createServer(app)
const io=socketio(server)
mongoose.Promise = global.Promise

//connect to mongodb
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/discussion',{
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })

const port=process.env.PORT||3000
const directoryPath=path.join(__dirname,'../public')

app.use(express.static(directoryPath))
app.use(express.json())

// let count=0
io.on('connection',(socket)=>{
console.log('new Websocket connection')
// socket.emit('updatedCount',count)
// socket.on('increment',()=>{
//     count++
//     io.emit('updatedCount',count)
// })
socket.on('join',(options,callback)=>{
const{ error,user }= addUsers({id:socket.id,...options})
if(error){
    return callback(error)
}
    socket.join(user.room)
    socket.emit('message',generateMessage('Admin','Welcome!'))
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
    callback()
})
socket.on('messagesend',(message,callback)=>{
    
    const filter=new Filter()
    if(filter.isProfane(message)){
        return callback('Profanity is not allowed!')
    }
    const user=getUser(socket.id) 
    io.to(user.room).emit('message',generateMessage(user.username,message))
    
    const check = {
        room:user.room
    }
    const update = {
        chats:{
            message:message,
            userName:user.username,
            createdAt:user.createdAt
        }
    }
    Message.findOneAndUpdate(check,{$push:update},{
        new:true,
        upsert:true,
        useFindAndModify:false
    })
    .then(data => console.log(data))
    .catch(console.log)
})

socket.on('sendLocation',(coords,callback)=>{
    const user=getUser(socket.id)
    io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`) )
    callback()
    
})
socket.on('disconnect', ()=>{
    const user=removeUser(socket.id)
    if(user){

        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    }
})
})

app.get('/chat/:room',(req,res) => {
    const { room } = req.params;
    Message.findOne({room})
    .then(messages => {
        if(messages)
        res.json(messages.chats);
    })
})

//===================
server.listen(port,()=>{
    console.log('server is up on port 3000')
})