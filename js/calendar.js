(function() {
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    Date.prototype.getMonthName = function() {
        return months[ this.getMonth() ];
    };
    Date.prototype.getDayName = function() {
        return days[ this.getDay() ];
    };
})();

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();

    if (hours === 12 && minutes === 0) {
        return 'noon'
    }

    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}


$(document).ready(function() {
    var table = document.getElementById("calendar");
    var tbody = document.createElement('tbody');

    var numCols = 7;
    var numHoursAwake = 15
    var intervalsPerHour = 2
    var numRows = intervalsPerHour * numHoursAwake

    var dayOfWeek = 1;// TODO Random
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
        timeLabel.appendChild(document.createTextNode(formatAMPM(time)));
        time.setMinutes(time.getMinutes() + (60/intervalsPerHour))

        tr.appendChild(timeLabel);
        for (var col = 0; col < numCols; col++) {
            var td = document.createElement('td');
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
});

$(function () {
  var isMouseDown = false,
    isHighlighted;
  $("#calendar td")
    .mousedown(function () {
      isMouseDown = true;
      $(this).toggleClass("highlighted");
      isHighlighted = $(this).hasClass("highlighted");
      return false; // prevent text selection
    })
    .mouseover(function () {
      if (isMouseDown) {
        $(this).toggleClass("highlighted", isHighlighted);
      }
    })
    .bind("selectstart", function () {
      return false;
    })

  $(document)
    .mouseup(function () {
      isMouseDown = false;
    });
});
