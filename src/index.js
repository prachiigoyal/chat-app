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
//mongodb+srv://chatapp:Admin@123456@cluster0.2im1i.mongodb.net/chat app?retryWrites=true&w=majority
const uri= 'mongodb+srv://chatapp:Admin@123456@cluster0.2im1i.mongodb.net/chatapp?retryWrites=true&w=majority'
mongoose.connect(process.env.MONGODB_URI || uri,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })

const port=process.env.PORT || 3000
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
    
    const newMessage = new Message({
        message:message,
        userName:user.username,
        createdAt:user.createdAt
    });
    newMessage.save()
    .then(saved => {
        console.log(saved);
        return callback()
    }).catch(err => console.log(err));

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

app.get('/chat',(req,res) => {
    Message.find({})
    .then(messages => {
        io.to(user.room).emit(messages)
        // res.json(messages);
    })
})

//===================
server.listen(port,()=>{
    console.log('server is up on port 3000')
})