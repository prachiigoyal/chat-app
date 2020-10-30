const mongoose=require('mongoose')

const messageSchema = new mongoose.Schema({
    // message:String,
    // userName:String,
    room:String,
    chats:[{
        message:String,
        userName:String,
        createdAt:{
            type:Date,
            default:Date.now()
        }
    }]
})

const Message = mongoose.model('messages',messageSchema)

module.exports = Message;