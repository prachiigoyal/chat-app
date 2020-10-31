var roomVal;
var userName = document.getElementById("username");
var roomField = document.getElementById("room");

window.onload = () => {
    var hashParams = window.location.hash.substr(1);
    if(hashParams){
    var p = hashParams.split('=');
    roomVal = decodeURIComponent(p[1]);
    document.getElementById(p[0]).value = roomVal;
    document.getElementById(p[0]).setAttribute("value",roomVal);
    // document.getElementById('room').setAttribute("disabled","");    
    }
}

// userName.addEventListener('change',() => {
//     roomField.value = roomVal;
//     // console.log(roomField.value)
// })