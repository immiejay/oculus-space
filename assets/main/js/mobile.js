// Generated by CoffeeScript 1.6.3
(function() {
  var socket;

  window.App = {
    room: null,
    data: {},
    adjustment: {
      cX: 0,
      cY: 0,
      cZ: 0
    },
    utils: {},
    DEBUG_MODE: true
  };

  socket = io.connect('/');

  socket.on('connect', function(data) {
    if (App.DEBUG_MODE) {
      return socket.emit('init: add controller');
    }
  });

  socket.on("disconnect", function(data) {
    $('#disconnected').fadeIn(500);
    return setTimeout("location.href = location.href", 4500);
  });

  socket.on("init: connected to room", function(data) {
    App.room = data.room;
    $('#room_id').text(data.room);
    $('#mobile_hud').fadeIn(300);
    return setInterval(function() {
      return socket.emit('broadcast', {
        room: App.room,
        event: "room: data",
        data: {
          cX: App.utils.normalize(App.data.cX - App.adjustment.cX),
          cY: App.utils.normalize(App.data.cY - App.adjustment.cY),
          cZ: App.utils.normalize(App.data.cZ - App.adjustment.cZ)
        }
      });
    }, 100);
  });

  $("#initialize").submit(function() {
    $("#initialize button").attr('disabled', 'disabled').text("Connecting...");
    $("#initialize input").blur();
    socket.emit('init: add controller', {
      room: $("#initialize input").val()
    });
    return false;
  });

  $('#room').keyup(function() {
    return $('#room').val($('#room').val().toUpperCase());
  });

  App.utils.normalize = function(number, range) {
    if (range == null) {
      range = 360;
    }
    if (!typeof number === "number") {
      return 0;
    } else {
      while (number > range / 2) {
        number -= range;
      }
      while (number < -range / 2) {
        number += range;
      }
      return number;
    }
  };

}).call(this);