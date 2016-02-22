function login() {
    var username = $('#username').val();
    $.ajax({
        type: "POST",
        url: "/user/cashtag/" + username,
        success: function(response) {
            createCookie('username', username, 7);
            window.location.href = "schedule.html";
        },
        dataType: "json"
    });
}

function getGender() {
    return document.querySelector('input[name="gender"]:checked').value;
}

function getAge() {
    var e = document.getElementById("age");
    return e.options[e.selectedIndex].value;
}

function isProcrastinator() {
    var workethic = $('input[name=work-ethic]:checked');
    if (workethic) {
        return workethic.val() === "procrastinator";
    }
    return null;
}

function getWakeTime() {
    var e = document.getElementById("wakeup");
    return parseInt(e.options[e.selectedIndex].value);
}

function getBedTime() {
    var e = document.getElementById("bedtime");
    return parseInt(e.options[e.selectedIndex].value);
}

function getJobStart() {
    var e = document.getElementById("jobstart");
    return parseInt(e.options[e.selectedIndex].value);
}

function getJobEnd() {
    var e = document.getElementById("jobend");
    return parseInt(e.options[e.selectedIndex].value);
}

function signup() {
    var username = $('#new-username').val();
    var gender = getGender();
    var age = getAge();
    var procrastinator = isProcrastinator();
    var wakeTime = getWakeTime();
    var bedTime = getBedTime();
    var jobStart = getJobStart();
    var jobEnd = getJobEnd();

    var signupData = {
        Cashtag: username,
        Gender: gender,
        Age: age,
        Procrastinator: procrastinator,
        WakeUpTime: wakeTime,
        SleepTime: bedTime,
        HasJob: true,
        JobStart: jobStart,
        JobEnd: jobEnd
    };

    $.ajax({
        type: "POST",
        url: "/user/",
        data: signupData,
        success: function(response) {

        },
        dataType: "json"
    });
}
