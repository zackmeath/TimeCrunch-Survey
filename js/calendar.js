// profile

var profile = {
    username: null,
    uid: -1,
    hasJob: false,
    jobstart: null,
    jobend: null,
    waketime: 8 * 4,
    sleeptime:20 * 4,
    score:  0,
    numHoursAwake: 15
}

var task = null;
var isMouseDown = false;
var isHighlighted = false;

function loadProfile() {
    profile.username      = readCookie("username");
    profile.uid           = readCookie("uid");
    profile.score         = readCookie("score");
    profile.hasJob        = readCookie("hasjob") === "true";
    profile.jobstart      = readCookie("jobstart");
    profile.jobend        = readCookie("jobend");
    profile.waketime      = readCookie("wakeuptime");
    profile.sleeptime     = readCookie("sleeptime");
    profile.numHoursAwake = (profile.sleeptime - profile.waketime) / 4;
    $("#score").text(profile.score);
    $("#username").text(profile.username);
}

function getRandomTask() {
    var tasks = [
        { name: "file taxes",                                 sentiment: -1 },
        { name: "do laundry",                                 sentiment: -1 },
        { name: "do math homework",                           sentiment: -1 },
        { name: "clean the house",                            sentiment: -1 },
        { name: "sweep the chimney",                          sentiment: -1 },
        { name: "do community service",                       sentiment: -1 },
        { name: "clean out the fridge",                       sentiment: 0 },
        { name: "hide the body",                              sentiment: 0 },
        { name: "read a book",                                sentiment: 0 },
        { name: "kill Hitler",                                sentiment: 0 },
        { name: "practise your magic tricks",                 sentiment: 0 },
        { name: "go grocery shopping",                        sentiment: 0 },
        { name: "mow the lawn",                               sentiment: 0 },
        { name: "bake cookies",                               sentiment: 1 },
        { name: "assemble a puzzle",                          sentiment: 1 },
        { name: "go fishing",                                 sentiment: 1 },
        { name: "rewatch Game of Thrones",                       sentiment: 1 },
        { name: "find out why they whitewashed Gods of Egypt", sentiment: 1 },
        { name: "build a snowman",                             sentiment: 1 },
    ];
    return tasks[randomInt(0, tasks.length-1)];
}

function generateTask() {
    var randomTask = getRandomTask();
    var randomTimeslots = randomInt(1, 10);

    task = {
        title:              randomTask.name,
        sentiment:          randomTask.sentiment,
        timeslots:          randomTimeslots,
        timeslotsRemaining: randomTimeslots,
        startInterval:      randomInt(0, profile.numHoursAwake-1),
        startDay:           randomInt(0, 7),
        endInterval:        randomInt(0, profile.numHoursAwake-1),
        daysUntilDueDate:   randomInt(1, 21)
    };
    generateTable();

    $("#time-remaining").text(task.timeslotsRemaining + ":00");
    $("#due-date").text(task.daysUntilDueDate);
    $("#eta").text(task.timeslots);
    $("#task-title").text(task.title);
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
    if (task.timeslotsRemaining == 0){
        var taskData = {
            UID:                    profile.uid,
            TaskSentiment:          task.sentiment,
            TaskLength:             task.timeslots,
            TaskScheduledDateMonth: 0,
            TaskScheduledDoW:       task.startDay,
            TaskScheduledTime:      task.startInterval,
            TaskDueDate:            getDueDateInterval(),
            Chunks:                 getCellsWithClass("highlighted"),
            Obstacles:              getCellsWithClass("busy")
        };

        $.ajax({
            type: "POST",
            url: "http://liamca.in:3000/api/survey/task/",
            data: taskData,
            crossDomain: true,
            success: function(response) {
                profile.score = response.score;
                createCookie("score", profile.score, 365);
                $("#score").text(profile.score);
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
    var numCols = task.daysUntilDueDate;
    var numRows = intervalsPerHour * profile.numHoursAwake;

    var time = new Date();
    time.setDate(task.startDay);
    time.setHours(profile.waketime / 4);
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
            if (col === 0 && row === task.startInterval) {
                td.className = "startTime";
            } else if (col === 0 && row < task.startInterval) {
                td.className = "inactive";
            } else if (col === task.daysUntilDueDate - 1 && row === task.endInterval) {
                td.className = "endTime";
            } else if (col === task.daysUntilDueDate - 1 && row > task.endInterval) {
                td.className = "inactive";
            } else if (profile.hasJob === true) {
                var interval = parseInt(profile.waketime) + row * 4;
                var day = (task.startDay + col) % 7
                if (day >= 1 && day <= 5 && interval >= profile.jobstart && interval < profile.jobend) {
                    td.className = "busy";
                }
            } else if (Math.random() < 0.1) {
                td.className = "busy";
            }
            if (td.className == "") {
                numAvailableSlots++;
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    if (numAvailableSlots < task.timeslots) {
        generateTask();
    }
}

$(function () {
    loadProfile();
    if (!profile.username) { // if no username, "logout"
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
            task.timeslotsRemaining++;
            $(this).toggleClass("highlighted", false);
            isHighlighted = false;
        } else {
            if (task.timeslotsRemaining > 0) {
                task.timeslotsRemaining--;
                $(this).toggleClass("highlighted", true);
                isHighlighted = true;
            }
        }
        $("#time-remaining").text(task.timeslotsRemaining + ":00");
        $("#next-button").toggleClass("disabled", task.timeslotsRemaining > 0);
        return false; // prevent text selection
    });

    $("#calendar").on("mouseover", "td", function () {
        if (isMouseDown) {
            if ($(this).hasClass("inactive") || $(this).hasClass("busy")) {
                return;
            }
            var alreadyHighlighted = $(this).hasClass("highlighted");
            if (isHighlighted) {
                if (task.timeslotsRemaining > 0) {
                    $(this).toggleClass("highlighted", isHighlighted);
                    if (!alreadyHighlighted) {
                        task.timeslotsRemaining--;
                    }
                }
            } else {
                $(this).toggleClass("highlighted", isHighlighted);
                if (alreadyHighlighted) {
                    task.timeslotsRemaining++;
                }
            }
            $("#time-remaining").text(task.timeslotsRemaining + ":00");
            $("#next-button").toggleClass("disabled", task.timeslotsRemaining > 0);
        }
    });
    $("#calendar").on("selectstart", "td", function () {
        return false;
    });
    $(document).mouseup(function () {
        isMouseDown = false;
    });
});
