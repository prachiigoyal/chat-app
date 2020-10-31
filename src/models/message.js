const mongoose=require('mongoose')

const messageSchema = new mongoose.Schema({
    room:{
        type:String,
        required:true,
        unique:true
    },
    chats:[{
        message:String,
        userName:String,
        createdAt:{
            type:Date,
            default:Date.now()
        },
        required:false,
        default:[]
    }]
})

const Message = mongoose.model('messages',messageSchema)

module.exports = Message;