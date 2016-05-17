$(document).ready(main);

function main() {
  var clock = new Clock();

  $('[data-toggle="tooltip"]').tooltip({placement : 'top'});
  $('button').on('click',clock.buttons.btnHandler);
  clock.setIdle(true);
}

function Clock() {

  var idleMode, idleInterval, setMode, timerMode;
  var clck = this;
  var display = new Display();
  var timer = new Timer();
  this.buttons = new Buttons();

  this.setIdle = function(bool) {
    idleMode = bool;
    if (bool) {
      var nowTime = (new Date(Date.now())).toLocaleTimeString();
      idleInterval = setInterval(display.idleDisplay,3000);
    }

      else {
        clearInterval(idleInterval);
        display.clearIndicators('ledIdle');
      }
    };

    function Display() {
      var blinkID, blinked = false, prevDisplayID, prevTimerID, displayedHours,  displayedMinutes,  displayedSeconds, displayedPomodoro, timerID, alarmID, alarmActive = false;

      this.displayTime = function(milsec,current) {
        var dTime = new Date(milsec), dHours = dTime.getUTCHours(), dMinutes = dTime.getUTCMinutes(), dSeconds = dTime.getUTCSeconds(), pomodoros =  (current) ? timer.getCurrentPomodoros() : timer.getPomodoros();
        var addZeroIfOneDigit = function(num) {return (num < 10 ? '0' : '') + num;};

        if (milsec < 0) $('#negativeSign').text('-');
        else $('#negativeSign').text('');

        $('#timerHours').text(addZeroIfOneDigit(dHours));
        $('#timerMinutes').text(addZeroIfOneDigit(dMinutes));
        $('#timerSeconds').text(addZeroIfOneDigit(dSeconds));
        $('#pomodorosCount').text(addZeroIfOneDigit(pomodoros));
      };

      this.changeSetValue = function() {
        prevDisplayID = null;
        var sessionIsSet = $('#sessionIndicator').hasClass('ledSet');
        var shortBreakIsSet = $('#shortBreakIndicator').hasClass('ledSet');
        var longBreakIsSet = $('#longBreakIndicator').hasClass('ledSet');

        if ((!sessionIsSet && !shortBreakIsSet && !longBreakIsSet) || longBreakIsSet) {
          $('#longBreakIndicator').removeClass('ledSet');
          $('#sessionIndicator').addClass('ledSet');
          display.displayTime(timer.getSessionTime());
        }

        else if (sessionIsSet) {
          $('#sessionIndicator').removeClass('ledSet');
          $('#shortBreakIndicator').addClass('ledSet');
          display.displayTime(timer.getShortBreakTime());
        }

        else if (shortBreakIsSet) {
          $('#shortBreakIndicator').removeClass('ledSet');
          $('#longBreakIndicator').addClass('ledSet');
          display.displayTime(timer.getLongBreakTime());
        }
        this.blink();
      };

      this.blink = function() {
        var displayID;
        this.stopBlink();

          if (prevDisplayID !== null) {
            displayID = (prevDisplayID === '#timerMinutes') ? '#timerSeconds' : (prevDisplayID === '#timerSeconds') ? '#pomodorosCount' : (prevDisplayID === '#pomodorosCount') ? '#timerHours' : '#timerMinutes';
          }
          else displayID = '#timerMinutes';

        prevDisplayID = displayID;
        blinkID = setInterval(function() {$(displayID).toggleClass('hideText');},500);
      };

      this.stopBlink = function() {
        clearInterval(blinkID);
        $('#timerHours').removeClass('hideText');
        $('#timerMinutes').removeClass('hideText');
        $('#timerSeconds').removeClass('hideText');
        $('#pomodorosCount').removeClass('hideText');
      };

        this.adjustValue = function(direc) {
            var curVal = +$(prevDisplayID).text();
            var addZeroIfOneDigit = function(num) {return (num < 10 ? '0' : '') + num;}, maxVal, minVal;
            switch (prevDisplayID) {
              case '#timerHours':
                maxVal = 23;
                if ($('#timerMinutes').text() === '00' && $('#timerSeconds').text() === '00') minVal = 1;
                else minVal = 0;
                break;

              case '#timerMinutes':
              maxVal = 59;
              if ($('#timerHours').text() === '00' && $('#timerSeconds').text() === '00') minVal = 1;
              else minVal = 0;
              break;

              case '#timerSeconds':
              maxVal = 59;
              if ($('#timerHours').text() === '00' && $('#timerMinutes').text() === '00') minVal = 1;
              else minVal = 0;
              break;

              case '#pomodorosCount':
              maxVal = 99;
              minVal = 1;
              break;
            }

          if (direc === 'up') {
          if (curVal < maxVal) $(prevDisplayID).text(addZeroIfOneDigit(curVal + 1));
          }
          else if (curVal > minVal) $(prevDisplayID).text(addZeroIfOneDigit(curVal - 1));
        };

      this.idleDisplay = function() {
          var sessionIsDisplayed = $('#sessionIndicator').hasClass('ledIdle');
          var shortBreakIsDisplayed = $('#shortBreakIndicator').hasClass('ledIdle');
          var longBreakIsDisplayed = $('#longBreakIndicator').hasClass('ledIdle');

          if ((!sessionIsDisplayed && !shortBreakIsDisplayed && !longBreakIsDisplayed)||longBreakIsDisplayed) {
            $('#longBreakIndicator').removeClass('ledIdle');
            $('#sessionIndicator').addClass('ledIdle');
            display.displayTime(timer.getSessionTime());
          }
          else if (sessionIsDisplayed) {
            $('#sessionIndicator').removeClass('ledIdle');
            $('#shortBreakIndicator').addClass('ledIdle');
            display.displayTime(timer.getShortBreakTime());
          }
          else if (shortBreakIsDisplayed) {
            $('#shortBreakIndicator').removeClass('ledIdle');
            $('#longBreakIndicator').addClass('ledIdle');
            display.displayTime(timer.getLongBreakTime());
          }
        };

      this.clearIndicators = function(clss) {
        $('#sessionIndicator').removeClass(clss);
        $('#shortBreakIndicator').removeClass(clss);
        $('#longBreakIndicator').removeClass(clss);
        $('#timerHours').text('00');
        $('#timerMinutes').text('00');
        $('#timerSeconds').text('00');
        $('#pomodorosCount').text('00');
      };

      this.updateTimerVariables = function() {
        var sessionIsSet = $('#sessionIndicator').hasClass('ledSet');
        var shortBreakIsSet = $('#shortBreakIndicator').hasClass('ledSet');
        var longBreakIsSet = $('#longBreakIndicator').hasClass('ledSet');
        var displayHours, displayMinutes, displaySeconds, displayPomodoros, milsec;

        displayHours = +$('#timerHours').text();
        displayMinutes = +$('#timerMinutes').text();
        displaySeconds = +$('#timerSeconds').text();
        displayPomodoros = +$('#pomodorosCount').text();
        milsec = (displayHours * 60 * 60 * 1000) + (displayMinutes * 60 * 1000) + (displaySeconds * 1000);

        if (sessionIsSet) timer.setSessionTime(milsec);
        else if (shortBreakIsSet) timer.setShortBreakTime(milsec);
        else if (longBreakIsSet) timer.setLongBreakTime(milsec);
        timer.setPomodoros(displayPomodoros);
      };

      this.setTimer = function() {
        var sessionIsSet = $('#sessionIndicator').hasClass('ledPlay');
        var shortBreakIsSet = $('#shortBreakIndicator').hasClass('ledPlay');
        var longBreakIsSet = $('#longBreakIndicator').hasClass('ledPlay');

        if (!sessionIsSet && !shortBreakIsSet && !longBreakIsSet) timer.setCurrentPomodoros();

        if ((!sessionIsSet && !shortBreakIsSet && !longBreakIsSet) || longBreakIsSet || shortBreakIsSet) {
          $('#shortBreakIndicator').removeClass('ledPlay');
          $('#longBreakIndicator').removeClass('ledPlay');
          $('#sessionIndicator').addClass('ledPlay');
          prevTimerID = '#sessionIndicator';
          timer.setCurrentTime(timer.getSessionTime());
        }

        else if (sessionIsSet && timer.getCurrentPomodoros() > 0) {

          $('#sessionIndicator').removeClass('ledPlay');
          $('#shortBreakIndicator').addClass('ledPlay');
          prevTimerID = '#shortBreakIndicator';
          timer.setCurrentTime(timer.getShortBreakTime());
        }

        else if (sessionIsSet && timer.getCurrentPomodoros() === 0) {
          $('#sessionIndicator').removeClass('ledPlay');
          $('#longBreakIndicator').addClass('ledPlay');
          prevTimerID = '#longBreakIndicator';
          timer.setCurrentPomodoros();
          timer.setCurrentTime(timer.getLongBreakTime());
        }
        timerID = setInterval(this.startTimer, 1000);
      };

      this.startTimer = function() {
        display.displayTime(timer.getCurrentTime(),true);
        timer.decreaseCurrentTime(1000);
        if (timer.getCurrentTime() < 0) display.startAlarm();
      };

      this.pauseTimer = function() {
        if (!alarmActive) {
          if ($(prevTimerID).hasClass('ledPlay')) {
          clearInterval(timerID);
          $(prevTimerID).removeClass('ledPlay');
          $(prevTimerID).addClass('ledPause');
          }
          else if ($(prevTimerID).hasClass('ledPause')) {
            $(prevTimerID).removeClass('ledPause');
            $(prevTimerID).addClass('ledPlay');
            timerID = setInterval(this.startTimer, 1000);
          }
        }
      };

      this.stopTimer = function() {
        if (!alarmActive) {
        clearInterval(timerID);
        display.clearIndicators('ledPlay');
        display.clearIndicators('ledPause');
        timerMode = false;
        clck.setIdle(true);
        }
      };

      this.startAlarm = function() {
        clearInterval(timerID);
        alarmActive = true;
        $('#alarmSound').prop('currentTime',0);
        $('#alarmSound').trigger('play');
        alarmID = setInterval(function(){$(prevTimerID).toggleClass('ledAlarm');},200);
      };

      this.stopAlarm = function() {
        if (alarmActive) {
          clearInterval(alarmID);
          $(prevTimerID).removeClass('ledAlarm');
          if (prevTimerID === '#sessionIndicator') timer.decrementCurrentPomodoros();
          alarmActive = false;
          $('#alarmSound').trigger('pause');
          display.setTimer();
        }
      };
    }

    function Buttons() {
      this.btnHandler = function() {
        var btnId = $(this).attr('id');
        $(this).blur();

        switch (btnId) {
          case 'setTimersButton':
            if (idleMode) {
              clck.setIdle(false);
              setMode = true;
            }

            if (idleMode || setMode) display.changeSetValue();
            break;

          case 'setHMSPToggle':
            if (setMode) display.blink();
            break;

          case 'setHMSPDown':
            if (setMode) display.adjustValue('down');
            break;

          case 'setHMSPUp':
            if (setMode) display.adjustValue('up');
            break;

          case 'saveChanges':
            if (setMode) display.updateTimerVariables();

          case 'discardChanges':
            if (setMode) {
            display.stopBlink();
            display.clearIndicators('ledSet');
            setMode = false;
            clck.setIdle(true);
            }
            break;

          case 'playButton':
            if (idleMode) {
              clck.setIdle(false);
              timerMode = true;
              display.setTimer();
            }
            break;

          case 'pauseButton':
            if (timerMode) display.pauseTimer();
            break;

          case 'stopButton':
            if (timerMode) display.stopTimer();
            break;

          case 'alarmButton':
            if (timerMode) display.stopAlarm();
            break;
        }
      };
    }

    function Timer() {
      var sessionTime = 1000 * 60 * 25; //25 minutes
      var shortBreakTime = 1000 * 60 * 5; //5 minutes
      var longBreakTime = 1000 * 60 * 30; //30 minutes
      var pomodoros = 4;
      var currentTime, currentPomodoros = pomodoros;

      this.setSessionTime = function(milsec) {
        sessionTime = milsec;
      };

      this.getSessionTime = function() {
        return sessionTime;
      };

      this.setShortBreakTime = function(milsec) {
        shortBreakTime = milsec;
      };

      this.getShortBreakTime = function() {
        return shortBreakTime;
      };

      this.setLongBreakTime = function(milsec) {
        longBreakTime = milsec;
      };

      this.getLongBreakTime = function() {
        return longBreakTime;
      };

      this.setPomodoros = function(num) {
        pomodoros = num;
        currentPomodoros = pomodoros;
      };

      this.getPomodoros = function() {
        return pomodoros;
      };

      this.setCurrentPomodoros = function() {
        currentPomodoros = pomodoros;
      };

      this.getCurrentPomodoros = function() {
        return currentPomodoros;
      };

      this.decrementCurrentPomodoros = function() {
        currentPomodoros--;
      };

      this.getCurrentTime = function() {
        return currentTime;
      };

      this.setCurrentTime = function(milsec) {
        currentTime = milsec;
      };

      this.decreaseCurrentTime = function(milsec) {
        currentTime -= milsec;
      };
    }
}
