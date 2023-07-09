const socket=io()

let name;
let textarea=document.querySelector('#textarea')
let messageArea=document.querySelector('.messageArea')
let button=document.querySelector('#sendButton')

let isTyping = false; // Variable to track typing state

// const memberList = document.querySelector('#memberList');
// const Available_Names=new Set();
// Available_Names.add("Harsh")
do{
    name=prompt('Please Enter your name')
    
} while(!name)
socket.emit('login', name);
socket.emit('join', name);

// Track Typing
// Event listener for typing
textarea.addEventListener('input', () => {
    if (!isTyping) {
      isTyping = true;
      socket.emit('typing', name);
    }
  });

  // Event listener for stop typing
textarea.addEventListener('blur', () => {
    if (isTyping) {
      isTyping = false;
      socket.emit('stopTyping', name);
    }
  });

  // Here we changed the event from keyup to keydown as keyup will 1st trigger the default value of the key and then the desired
  // thing that we want,here the key is ENTER so whenver ENTER is pressed,the cursor will 1st move to next line and then the msg 
  // be sent,to prevent this we use 'keydown' as an event
textarea.addEventListener(/*'keyup'*/'keydown',(event)=>{
    if(event.key==='Enter' && !event.shiftKey){
      event.preventDefault();
      sendMessage(event.target.value)
    }
    button.onclick=function(){
        sendMessage(event.target.value)
    }
})

function sendMessage(message){

    if(message.trim()===''){
        return;
    }

    let msg={
        user : name,
        message : message.trim(),
        timestamp: new Date().getTime()
    }

    appendMessage(msg,'Outgoing')
    textarea.value=''
    scrollToBottom()
    socket.emit('Event',msg)
    
}

function appendMessage(msg,type){
    let mainDiv=document.createElement('div')
    let className=type
    mainDiv.classList.add(className,'Message')
    // mainDiv.setAttribute('data-message-id', msg.id); // Add a unique identifier to the message element
    let timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let markup=`

            <h4>${msg.user}</h4>
            <p>${msg.message}</p>
            <span class="timestamp">${timestamp}</span>
    
    `
    mainDiv.innerHTML=markup
    messageArea.appendChild(mainDiv)
}
function appendNewEntry(msg,type){
    let mainDiv=document.createElement('div')
    let className=type
    mainDiv.classList.add(className)
    mainDiv.innerHTML=msg
    messageArea.appendChild(mainDiv)
}

// NOTIFICATION


if ('Notification' in window) {
    Notification.requestPermission();
  }

  function displayNotification(message) {
    if (Notification.permission === 'granted') {
      const notification = new Notification('New Message', {
        body: message,
        icon: './notification.png', // Replace with your notification icon
      });
  
      notification.onclick = function () {
        window.focus();
      };
    }
  }
  

// ...

// Add a context menu event listener to the message area
// messageArea.addEventListener('contextmenu', (event) => {
//     event.preventDefault(); // Prevent the default context menu
  
//     const clickedMessage = event.target.closest('.Message');
//     if (clickedMessage) {
//       // Create a context menu container
//       const menuContainer = document.createElement('div');
//       menuContainer.classList.add('ContextMenu');
//       menuContainer.innerHTML = `
//         <ul>
//           <li class="delete">Delete</li>
//           <li class="deleteEveryone">Delete for Everyone</li>
//         </ul>
//       `;
  
//       // Get the mouse position
//       const x = event.clientX;
//       const y = event.clientY;
  
//       // Set the position of the context menu
//       menuContainer.style.top = `${y}px`;
//       menuContainer.style.left = `${x}px`;
  
//       // Append the context menu to the document
//       document.body.appendChild(menuContainer);
  
//       // Add mousedown event listeners to the menu items
//       const deleteOption = menuContainer.querySelector('.delete');
//       const deleteEveryoneOption = menuContainer.querySelector('.deleteEveryone');
  
//       // Delete the message when clicked
//       deleteOption.addEventListener('mousedown', () => {
//         deleteMessage(clickedMessage);
//         menuContainer.remove();
//       });
  
//       // Delete the message for everyone when clicked
//       deleteEveryoneOption.addEventListener('mousedown', () => {
//         deleteMessageForEveryone(clickedMessage);
//         menuContainer.remove();
//       });
  
//       // Remove the context menu when clicking outside of it
//       document.addEventListener('mousedown', (event) => {
//         if (!menuContainer.contains(event.target)) {
//           menuContainer.remove();
//         }
//       });
//     }
//   });
  
  // ...
  
    // function deleteMessage(messageElement) {
    //     messageElement.remove();
    
    // }
  
//   function showContextMenu(contextMenu, x, y) {
//     const menuContainer = document.createElement('div');
//     menuContainer.classList.add('context-menu');
//     menuContainer.style.top = `${y}px`;
//     menuContainer.style.left = `${x}px`;
  
//     contextMenu.forEach((item) => {
//       const menuItem = document.createElement('div');
//       menuItem.textContent = item.label;
//       menuItem.addEventListener('click', () => {
//         item.action();
//         menuContainer.remove(); // Remove the context menu after clicking an option
//       });
  
//       menuContainer.appendChild(menuItem);
//     });
  
//     document.body.appendChild(menuContainer);
//   }
  

// Handle new member added to the sidebar
// socket.on('addMember', (memberId) => {
//     addMember(memberId);
//   });
  
//   function addMember(memberId) {
//     const memberItem = document.createElement('li');
//     memberItem.textContent = memberId;
//     memberItem.addEventListener('click', () => {
//       // Implement logic to display member's messages
//     });
//     memberList.appendChild(memberItem);
//   }
// RECEIVE MESSAGE FROM SERVER TO PASS THE CHAT TO THE OTHER GUY(THIS CAN BE DONE AS SOCKET WILL BRODCAST THE MSG TO EVRY BROWSER
// CONNECTED TO IT EXCEPT THR BROWSER THROUGH WHICH MSG WAS SENT AS IT IS ALREADY ADDED TO THE PAGE BY DOM)
    socket.on('join',(newJoin)=>{
        appendNewEntry(newJoin,'newEntry')
        scrollToBottom()
    })

// Handle typing event
    socket.on('typing', (username) => {
        const typingIndicator = document.querySelector('.typing-indicator');
        typingIndicator.textContent = `${username} is typing...`;
        typingIndicator.style.display = 'block';
  });
  
  // Handle stop typing event
    socket.on('stopTyping', (username) => {
        const typingIndicator = document.querySelector('.typing-indicator');
        typingIndicator.textContent = '';
        typingIndicator.style.display = 'none';
  });

  socket.on('Event',(msg)=>{
    appendMessage(msg,'Incoming')
    scrollToBottom()
    displayNotification(msg);
    console.log(msg)
  })

  socket.on('usernameExists', () => {
    alert('The username already exists. Please choose a different username.');
    location.reload();
  });
  
//   socket.on('userConnected', (username) => {
//     console.log(username)
//     console.log(`${username} connected`)
//   });
  
  socket.on('userDisconnected', (username) => {
    appendNewEntry(`<h4 style="font-weight:300; font-family:system-ui; color:gray;">${username} left the conversation </h4>`, 'newEntry');
  });


  function scrollToBottom(){
    messageArea.scrollTop=messageArea.scrollHeight
  }