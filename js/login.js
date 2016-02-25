function login() {
    var username = $('#username').val();
    $.ajax({
        type: "GET",
        url: "http://liamca.in:3000/api/survey/user/cashtag/" + username,
        crossDomain: true,
        success: function(response) {
            if (response.success) {
                var data = response.data[0];
                createCookie('username', data.cashtag, 365);
                createCookie('score', data.questionsansweredcount, 365);
                createCookie('uid', data.uid, 365);
                createCookie('jobstart', data.jobstart, 365);
                createCookie('jobend', data.jobend, 365);
                createCookie('procrastinator', data.procrastinator, 365);
                createCookie('hasjob', data.hasjob, 365);
                createCookie('sleeptime', data.sleeptime, 365);
                createCookie('wakeuptime', data.wakeuptime, 365);
                createCookie('gender', data.gender, 365);
                window.location.href = "schedule.html";
            } else {
                // console.log(response.err);
            }
        },
        dataType: "json",
        xhrFields: { withCredentials: false }
    });
}

function getGender() {
    return document.querySelector('input[name="gender"]:checked').value;
}

function getAge() {
    var e = document.getElementById("age");
    return e.options[e.selectedIndex].value;
}

function hasJob() {
    var employed = $('input[name=employed]:checked');
    if (employed) {
        return employed.val() === "job";
    }
    return null;
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
    var isEmployed = hasJob();
    var jobStart = null;
    var jobEnd = null;
    if (isEmployed) {
        jobStart = getJobStart();
        jobEnd = getJobEnd();
    }

    var signupData = {
        Cashtag: username,
        Gender: gender,
        Age: age,
        Procrastinator: procrastinator,
        WakeUpTime: wakeTime,
        SleepTime: bedTime,
        HasJob: isEmployed,
        JobStart: jobStart,
        JobEnd: jobEnd
    };

    $.ajax({
        type: "POST",
        url: "http://liamca.in:3000/api/survey/user/",
        data: signupData,
        crossDomain: true,
        success: function(response) {
            if (response.success) {
                var data = response.data[0];
                createCookie('uid', data.uid, 365);
                createCookie('username', username, 365);
                createCookie('gender', gender, 365);
                createCookie('score', 0, 365);
                createCookie('jobstart', jobStart, 365);
                createCookie('jobend', jobEnd, 365);
                createCookie('procrastinator', procrastinator, 365);
                createCookie('hasjob', isEmployed, 365);
                createCookie('wakeuptime', wakeTime, 365);
                createCookie('sleeptime', bedTime, 365);
                window.location.href = "schedule.html";
            } else {
                $('#error-alert').show();
            }
        },
        dataType: "json",
        xhrFields: { withCredentials: false }
    });
}

$("#new-username").keyup(function(event) {
    if (event.keyCode == 13) {
        signup();
    }
});

$("#username").keyup(function(event) {
    if (event.keyCode == 13) {
        login();
    }
});

$('#employed input:radio').change(function() {
        $('#form-jobstart').toggleClass("disabled");
        $('#form-jobend').toggleClass("disabled");
    }
);
