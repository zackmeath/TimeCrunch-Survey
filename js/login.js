function login() {
    var username = $('#username').val();
    createCookie('username', username, 7);
    window.location.href = "schedule.html";
}

function signup() {
}
