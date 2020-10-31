const socket = io()

// socket.on('updatedCount', (count) => {
//     console.log('the count has been updated', count)
// })
// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })
//====
const $messageForm=document.querySelector('#message-form')
const $formInput=$messageForm.querySelector('input')
const $formButton=$messageForm.querySelector('button')
const $messages=document.querySelector('#messages')

//====
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//=============
const { username,room }=Qs.parse(location.search,{ignoreQueryPrefix:true})
//===================
const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild

    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight

    const scrollOffset=$messages.scrollTop+ visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
    
    fetch(`http://localhost:3000/chat/${room}`,{
        method:'get',
        headers:{"Content-Type":"application/json"}
    }).then(res => res.json())
    .then(data => {
        var html = "";
        console.log("yes")
        for(var i=0;i<data.length;i++){
            html += Mustache.render(messageTemplate,{
                message:data[i].message,
                username:data[i].userName,
                createdAt:moment(data[i].createdAt).format('h:mm a')
            })
        }

        if(data)
            $messages.insertAdjacentHTML("beforeend",html)
        // console.log(data)
    })
    .catch(console.log)
})
socket.on('message', (message) => {
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        message:message.text,
        username:message.username,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
//=========================
socket.on('locationMessage', (message)=>{
    console.log(message)
    const html=Mustache.render(locationTemplate,{
        url:message.url,
        username:message.username,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
autoscroll()
})
socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})
//==================


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $formButton.setAttribute('disabled','disabled')
    
    const message = e.target.elements.message.value
    socket.emit('messagesend', message, (error) => {
        $formButton.removeAttribute('disabled')
        $formInput.value=''
        $formInput.focus()
if(error){
    return console.log(error)
}
console.log('Message Delivered!')
       
    })
})
//==============================
const $sendLocation=document.querySelector('#send-location')
$sendLocation.addEventListener('click', (position) => {
    if (!navigator.geolocation) {
        return alert('Your browser can not support navigator')
    }
    $sendLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            
        },()=>{
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})
