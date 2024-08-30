function save_options() {
    var APIurl = document.getElementById('urlAPI').value;
    chrome.storage.sync.set({
        urlAPI: APIurl,
      }, function() {
        show_status('Настройки сохранены.');
      });
}

function restore_options() {
    chrome.storage.sync.get({
        urlAPI: ''
    }, function(items) {
        document.getElementById('urlAPI').value = items.urlAPI;
    });
}

function clear_input_fields() {
    document.getElementById('login').value = '';
    document.getElementById('password').value = '';
    document.getElementById('token').value = '';
}

function show_status(message) {
    var status = document.getElementById('status');
    status.textContent = message;
    status.style.display = 'block';
    setTimeout(function() {
        status.style.display = 'none';
    }, 3000);
}

function load_users() {
    chrome.storage.sync.get({users: []}, function(result) {
        var userTable = document.getElementById('userTable').getElementsByTagName('tbody')[0];
        userTable.innerHTML = '';

        result.users.forEach(function(user, index) {
            var row = userTable.insertRow();
            row.insertCell(0).textContent = user.login;
            row.insertCell(1).textContent = user.password;
            row.insertCell(2).textContent = user.token;
            var actionsCell = row.insertCell(3);
            var deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                delete_user(index);
            });
            actionsCell.appendChild(deleteButton);
        });
    });
}

function add_user() {
    var login = document.getElementById('login').value;
    var password = document.getElementById('password').value;
    var token = document.getElementById('token').value;

    chrome.storage.sync.get({users: []}, function(result) {
        var users = result.users;
        users.push({login: login, password: password, token: token});
        chrome.storage.sync.set({users: users}, function() {
            load_users();
            clear_input_fields();
        });
    });
}

function delete_user(index) {
    chrome.storage.sync.get({users: []}, function(result) {
        var users = result.users;
        users.splice(index, 1);
        chrome.storage.sync.set({users: users}, function() {
            load_users();
        });
    });
}

function clear_input_fields() {
    document.getElementById('login').value = '';
    document.getElementById('password').value = '';
    document.getElementById('token').value = '';
}

document.addEventListener('DOMContentLoaded', function() {
    restore_options();
    load_users();
});

document.getElementById('addUser').addEventListener('click', add_user);
document.getElementById('save').addEventListener('click',
    save_options);