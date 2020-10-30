const mongoose=require('mongoose')

const messageSchema = new mongoose.Schema({
    message:String,
    userName:String,
},{
    timestamps:true
})

const Message = mongoose.model('messages',messageSchema)

module.exports = Message;