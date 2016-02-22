var timeslots;
var timeslotsRemaining;
var startInterval;
var startDay;
var endInterval;
var daysUntilDueDate;
var numHoursAwake = 15;
var isMouseDown = false;
var isHighlighted = false;

function generateTask(){
    timeslots = randomInt(1, 10);
    timeslotsRemaining = timeslots;

    $('#time-remaining').text(timeslotsRemaining + ":00");
    $('#next-button').addClass("disabled");
    $('#error-alert').hide();

    startInterval = randomInt(0, numHoursAwake-1);
    startDay = randomInt(0, 7);

    endInterval = randomInt(0, numHoursAwake-1);
    daysUntilDueDate = randomInt(1, 21);
    generateTable();

    var isMouseDown = false;
    var isHighlighted = false;
}

function next() {
    // TODO: send ajax request to server here
    if (timeslotsRemaining == 0){
        generateTask();
    } else {
        $('#error-alert').show();
    }
}

function generateTable() {
    var table = document.getElementById("calendar");

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    var tbody = document.createElement('tbody');

    var numCols = daysUntilDueDate;
    var intervalsPerHour = 1;
    var numRows = intervalsPerHour * numHoursAwake;

    var dayOfWeek = startDay;
    var hour = 8; // TODO selected from above
    var minute = "00";
    var time = new Date();
    time.setHours(8);
    time.setMinutes(0);
    time.setDate(dayOfWeek);

    // table headings
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.className = "firstTH"
    tr.appendChild(th);
    for (var col = 0; col < numCols; col++) {
        var th = document.createElement('th');
        th.appendChild(document.createTextNode(time.getDayName()));
        tr.appendChild(th);

        dayOfWeek++;
        time.setDate(dayOfWeek);
    }
    thead.appendChild(tr);
    table.appendChild(thead);

    for (var row = 0; row < numRows; row++) {
        var tr = document.createElement('tr');

        var timeLabel = document.createElement('td');
        timeLabel.className = "colHeading"
        timeLabel.appendChild(document.createTextNode(time.getFormattedTime()));
        time.setMinutes(time.getMinutes() + (60/intervalsPerHour))

        tr.appendChild(timeLabel);
        for (var col = 0; col < numCols; col++) {
            var td = document.createElement('td');
            if (col == 0 && row == startInterval) {
                td.className = "startTime";
            } else if (col == 0 && row < startInterval) {
                td.className = "inactive";
            } else if (col == daysUntilDueDate - 1 && row == endInterval) {
                td.className = "endTime";
            } else if (col == daysUntilDueDate - 1 && row > endInterval) {
                td.className = "inactive";
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
}

$(function () {
    var username = readCookie('username');
    $("#username").text(readCookie('username'));
    $('#error-alert').hide();

    generateTask();


    $("#calendar").on("mousedown", "td", function () {
        isMouseDown = true;
        var alreadyHighlighted = $(this).hasClass("highlighted");
        if ($(this).hasClass("inactive") ) {
            return;
        }
        if (alreadyHighlighted) {
            timeslotsRemaining = Math.min(timeslotsRemaining+1, timeslots);
            $(this).toggleClass("highlighted");
            isHighlighted = $(this).hasClass("highlighted");
        } else {
            if (timeslotsRemaining > 0) {
                timeslotsRemaining--;
                $(this).toggleClass("highlighted");
                isHighlighted = $(this).hasClass("highlighted");
            }
        }
        $('#time-remaining').text(timeslotsRemaining + ":00");
        $('#next-button').toggleClass("disabled", timeslotsRemaining > 0);
        return false; // prevent text selection
    });

    $("#calendar").on("mouseover", "td", function () {
        if (isMouseDown) {
            if (isHighlighted) {
                if (timeslotsRemaining > 0) {
                    $(this).toggleClass("highlighted", isHighlighted);
                    timeslotsRemaining--;
                }
            } else {
                $(this).toggleClass("highlighted", isHighlighted);
                timeslotsRemaining = Math.min(timeslotsRemaining+1, timeslots);
            }
            $('#time-remaining').text(timeslotsRemaining + ":00");
            $('#next-button').toggleClass("disabled",timeslotsRemaining > 0);
        }
    });
    $("#calendar").on("selectstart", "td", function () {
        return false;
    });
    $(document).mouseup(function () {
        isMouseDown = false;
    });
});
