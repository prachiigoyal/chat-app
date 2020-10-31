var groups = [];
const search = document.querySelector('.search');

window.onload = async () => {
    const allGroups = await fetch('https://groupchitchats.herokuapp.com/groups',{
        method:'get',
        headers:{'Content-type':'application/json'}
    });
    groups = await allGroups.json();
    const container = await document.querySelector(".groups");
    groups.forEach(element => {
        if(element.room){
        const group = document.createElement('a');
        group.appendChild(document.createTextNode(element.room));
        group.setAttribute("href",`/join.html#room=${element.room}`);
        group.setAttribute("class","room");
        container.appendChild(group);
        }
    });
}

const renderGroups = (arr) => {
   var container = document.querySelector(".groups");
   
   while (container.hasChildNodes())  
       container.removeChild(container.firstChild);

   arr.forEach(element => {
       if(element.room){
       const group = document.createElement('a');
       group.appendChild(document.createTextNode(element.room));
       group.setAttribute("href",`/join.html#room=${element.room}`);
       group.setAttribute("class","room");
       container.appendChild(group);
       }
   });
}

search.addEventListener('input',(event) => {
    var searchVal = event.target.value;
     console.log(searchVal)
     console.log(groups)
    if(searchVal !== ""){
    var newGroups = groups.filter(item => item && item.room
        && item.room.toLowerCase().includes(searchVal));
        renderGroups(newGroups);
    	 console.log(newGroups)
    } else{
        renderGroups(groups);
    }
})