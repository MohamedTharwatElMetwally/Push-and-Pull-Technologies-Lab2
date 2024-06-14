let username_h1 = document.getElementById('username');
let chat_div = document.getElementById('chat');
let chat_msg = document.getElementById('chatmsg');
let send_btn = document.getElementById('send');
let clear_btn = document.getElementById('clear');
let online_lst = document.getElementById('online');
let private_chat_div = document.getElementById('private_chat');
let privatebox = document.getElementById('privatebox');
let prvt_msg = document.getElementById('prvt_msg');
let prvt_send = document.getElementById('prvt_send');
let recipient = null;

private_chat_div.style.display = "none";

username = prompt('Please enter your name: ');
username_h1.innerHTML = username;

let mywebsocket = new WebSocket('ws://localhost:8000');

mywebsocket.onopen = function () {
    console.log('connection opened');
    let msg_to_send = {
        type: "login",
        username: username
    };
    mywebsocket.send(JSON.stringify(msg_to_send));
};

mywebsocket.onmessage = function (event) {
    let received_msg = JSON.parse(event.data);
    if (received_msg.type === 'login') {
        chat_div.innerHTML += `<h3 style="color: green; text-align: center">${received_msg.body}</h3>`;
    } else if (received_msg.type === 'logout') {
        chat_div.innerHTML += `<h3 style="color: red; text-align: center">${received_msg.body}</h3>`;
    } else if (received_msg.type === 'chat') {
        chat_div.innerHTML += `<h3 class="w-50 bg-light rounded-2 p-2 mx-2">${received_msg.body}</h3>`;
    } else if (received_msg.type === 'private_chat') {
        privatebox.innerHTML += `<h3 class="w-50 bg-light rounded-2 p-2 mx-2">${received_msg.body}</h3>`;
    }

    if (received_msg.online) {
        online_lst.innerHTML = '';
        received_msg.online.forEach((user) => {
            let li = document.createElement('li');
            li.innerText = user.name;
            let btn = document.createElement('button');
            btn.id = "btn_" + user.id;
            btn.innerText = 'Private Chat';
            btn.className = 'btn btn-success';
            btn.addEventListener("click", function () {
                recipient = user.id;
                private_chat_div.style.display = "block";
                privatebox.innerHTML = '';
            });
            li.appendChild(btn);
            online_lst.appendChild(li);
        });
    }
};

send_btn.addEventListener('click', function () {
    let msg_val = `${username}:${chat_msg.value}.`;
    let msg_to_send = {
        type: 'chat',
        body: msg_val
    };
    chat_div.innerHTML += `<h2 class="w-50 ms-auto bg-warning rounded-2 p-2 mx-2">Me:${chat_msg.value}</h2>`;
    mywebsocket.send(JSON.stringify(msg_to_send));
    chat_msg.value = '';
});

clear_btn.addEventListener('click', function () {
    chat_div.innerHTML = '';
});

prvt_send.addEventListener('click', function () {
    let msg_val = `${username}:${prvt_msg.value}`;
    let msg_to_send = {
        type: 'private_chat',
        body: msg_val,
        recipient: recipient
    };
    privatebox.innerHTML += `<h2 class="w-50 ms-auto bg-warning rounded-2 p-2 mx-2">Me:${prvt_msg.value}</h2>`;
    mywebsocket.send(JSON.stringify(msg_to_send));
    prvt_msg.value = '';
});
