// profile
var username  = null;
var uid       = -1;
var hasJob    = false;
var jobstart  = null;
var jobend    = null;
var waketime  = 8 * 4;
var sleeptime = 20 * 4;

var timeslots;
var timeslotsRemaining;
var startInterval;
var startDay;
var endInterval;
var daysUntilDueDate;
var numHoursAwake = 15;

var isMouseDown = false;
var isHighlighted = false;
var score = 0;

function loadProfile() {
    username      = readCookie("username");
    uid           = readCookie("uid");
    score         = readCookie("score");
    hasJob        = readCookie("hasjob");
    jobstart      = readCookie("jobstart");
    jobend        = readCookie("jobend");
    waketime      = readCookie("wakeuptime");
    sleeptime     = readCookie("sleeptime");
    numHoursAwake = (sleeptime - waketime) / 4;
    $("#score").text(score);
    $("#username").text(username);
}

function getRandomTaskTitle() {
    var taskTitles = [
        "file taxes",
        "laundry",
        "math homework",
        "go fishing",
        "kill Hitler",
        "bake cookies",
        "assemble a puzzle",
        "go grocery shopping"
    ];
    return taskTitles[randomInt(0, taskTitles.length-1)];
}

function generateTask() {
    timeslots        = timeslotsRemaining = randomInt(1, 10);
    startInterval    = randomInt(0, numHoursAwake-1);
    startDay         = randomInt(0, 7);
    endInterval      = randomInt(0, numHoursAwake-1);
    daysUntilDueDate = randomInt(1, 21);
    generateTable();

    $("#time-remaining").text(timeslotsRemaining + ":00");
    $("#due-date").text(daysUntilDueDate);
    $("#eta").text(timeslots);
    $("#task-title").text(getRandomTaskTitle());
    $("#next-button").addClass("disabled");
    $("#error-alert").hide();
    isMouseDown = false;
    isHighlighted = false;
}

function getCellsWithClass(classname) {
    var cells = [];
    $("td." + classname).each(function(i, obj) {
        cells.push(parseInt(obj.id));
    });
    return cells;
}

function getDueDateInterval() {
    var startInterval = parseInt($("td.startTime")[0].id);
    var endInterval = parseInt($("td.endTime")[0].id)
    return endInterval - startInterval;
}

function next() {
    if (timeslotsRemaining == 0){
        var taskData = {
            UID: uid,
            TaskSentiment: 0,
            TaskLength: timeslots,
            TaskScheduledDateMonth: 0,
            TaskScheduledDoW: startDay,
            TaskScheduledTime: startInterval,
            TaskDueDate: getDueDateInterval(),
            Chunks: getCellsWithClass("highlighted"),
            Obstacles: getCellsWithClass("busy")
        };
        $.ajax({
            type: "POST",
            url: "http://liamca.in:3000/api/survey/task/",
            data: taskData,
            crossDomain: true,
            success: function(response) {
                score++;
                $("#score").text(score);
                generateTask();
            },
            dataType: "json",
            xhrFields: { withCredentials: false }
        });
    } else {
        $("#error-alert").show();
    }
}

function generateTable() {
    var table = document.getElementById("calendar");
    while (table.firstChild) { table.removeChild(table.firstChild); }
    var tbody = document.createElement("tbody");

    var intervalsPerHour = 1;
    var numCols = daysUntilDueDate;
    var numRows = intervalsPerHour * numHoursAwake;

    var time = new Date();
    time.setDate(startDay);
    time.setHours(waketime / 4);
    time.setMinutes(0);

    // table headings
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    tr.appendChild(document.createElement("th"));
    for (var col = 0; col < numCols; col++) {
        var th = document.createElement("th");
        th.appendChild(document.createTextNode(time.getDayName()));
        tr.appendChild(th);
        time.setDate(time.getDate() + 1);
    }
    thead.appendChild(tr);
    table.appendChild(thead);

    var numAvailableSlots = 0;
    for (var row = 0; row < numRows; row++) {
        var tr = document.createElement("tr");
        var timeLabel = document.createElement("td");
        timeLabel.className = "column-heading";
        timeLabel.appendChild(document.createTextNode(time.getFormattedTime()));
        time.setMinutes(time.getMinutes() + (60 / intervalsPerHour));
        tr.appendChild(timeLabel);
        for (var col = 0; col < numCols; col++) {
            var td = document.createElement("td");
            td.id = (col * 96) + (row * 4);
            if (col === 0 && row === startInterval) {
                td.className = "startTime";
            } else if (col === 0 && row < startInterval) {
                td.className = "inactive";
            } else if (col === daysUntilDueDate - 1 && row === endInterval) {
                td.className = "endTime";
            } else if (col === daysUntilDueDate - 1 && row > endInterval) {
                td.className = "inactive";
            } else if (hasJob) {
                var interval = parseInt(waketime) + row * 4;
                var day = (startDay + col) % 7
                if (day >= 1 && day <= 5 && interval >= jobstart && interval < jobend) {
                    td.className = "busy";
                }
            }
            if (td.className == "") {
                numAvailableSlots++;
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    if (numAvailableSlots < timeslots) {
        generateTask();
    }
}

$(function () {
    loadProfile();
    if (!username) { // if no username, "logout"
        window.location.href = "liamca.in/survey/";
    }

    generateTask();

    $("#calendar").on("mousedown", "td", function () {
        isMouseDown = true;
        var alreadyHighlighted = $(this).hasClass("highlighted");

        // if timeslot is available
        if ($(this).hasClass("inactive") || $(this).hasClass("busy")) {
            return;
        }

        if (alreadyHighlighted) {
            timeslotsRemaining++;
            $(this).toggleClass("highlighted", false);
            isHighlighted = false;
        } else {
            if (timeslotsRemaining > 0) {
                timeslotsRemaining--;
                $(this).toggleClass("highlighted", true);
                isHighlighted = true;
            }
        }
        $("#time-remaining").text(timeslotsRemaining + ":00");
        $("#next-button").toggleClass("disabled", timeslotsRemaining > 0);
        return false; // prevent text selection
    });

    $("#calendar").on("mouseover", "td", function () {
        if (isMouseDown) {
            if ($(this).hasClass("inactive") || $(this).hasClass("busy")) {
                return;
            }
            var alreadyHighlighted = $(this).hasClass("highlighted");
            if (isHighlighted) {
                if (timeslotsRemaining > 0) {
                    $(this).toggleClass("highlighted", isHighlighted);
                    if (!alreadyHighlighted) {
                        timeslotsRemaining--;
                    }
                }
            } else {
                $(this).toggleClass("highlighted", isHighlighted);
                if (alreadyHighlighted) {
                    timeslotsRemaining++;
                }
            }
            $("#time-remaining").text(timeslotsRemaining + ":00");
            $("#next-button").toggleClass("disabled", timeslotsRemaining > 0);
        }
    });
    $("#calendar").on("selectstart", "td", function () {
        return false;
    });
    $(document).mouseup(function () {
        isMouseDown = false;
    });
});
