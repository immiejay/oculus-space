// Generated by CoffeeScript 1.4.0
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  App.Minigames.TapRace = (function(_super) {

    __extends(TapRace, _super);

    function TapRace() {
      this.start = __bind(this.start, this);
      return TapRace.__super__.constructor.apply(this, arguments);
    }

    TapRace.NAME = 'TapRace';

    TapRace.INSTRUCTIONS = 'TapRace is a fun game. Click link, plz.';

    TapRace.TEMPLATES = "/assets/minigames/tap_race/templates.js";

    TapRace.STYLESHEET = "/assets/minigames/tap_race/styles.css";

    TapRace.prototype.init = function() {
      TapRace.__super__.init.apply(this, arguments);
      this.currentNumber = 1;
      Array.prototype.shuffle = function() {
        return this.sort(function() {
          return 0.5 - Math.random();
        });
      };
      this.numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].shuffle();
      if (!(App.Templates.TapRace != null)) {
        $('head').append("<link rel='stylesheet' href='" + this.constructor.STYLESHEET + "'>");
        return $.getScript(this.constructor.TEMPLATES);
      }
    };

    TapRace.prototype.start = function() {
      var numbers, player, tds, that, _i, _len, _ref;
      this.startTime = new Date;
      _ref = this.players;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        player.currentNumber = 0;
      }
      this.el = $("<div>").attr({
        "id": "tap-race-minigame"
      });
      this.el.html(_.template(App.Templates.TapRace.main_view));
      numbers = this.numbers;
      tds = this.el.find("#tap-board td").each(function(i) {
        return $(this).text(numbers[i]);
      });
      this.render();
      $('body').append(this.el);
      that = this;
      return this.el.find("#tap-board td").bind("touchstart click", function() {
        if (parseInt($(this).text()) === that.currentNumber) {
          that.broadcast('player: scored', {
            number: that.currentNumber
          });
          that.currentNumber++;
          $(this).text('');
          if (that.currentNumber > 16) {
            return that.done();
          }
        }
      });
    };

    TapRace.prototype.render = function() {
      return this.el.find("#tap-race-players").html(_.template(App.Templates.TapRace.players_view, {
        players: this.players,
        currentPlayerId: App.player_id
      }));
    };

    TapRace.prototype.done = function() {
      var half, player, _i, _len, _ref,
        _this = this;
      _ref = this.players;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        if (player.id === App.player_id) {
          player.done = true;
        }
      }
      this.endTime = new Date;
      this.time = this.endTime - this.startTime;
      this.broadcast('player: done', {
        time: this.time
      });
      half = this.el.find(".top-half");
      return half.find("table").fadeOut(500, function() {
        var elem;
        elem = _.template(App.Templates.TapRace.done, {
          time: _this.time / 1000
        });
        elem = $(elem);
        elem.hide();
        half.html(elem);
        return elem.fadeIn(500);
      });
    };

    TapRace.prototype.gameover = function() {
      $(this.el).fadeOut();
      console.log(this.players);
      return App.metagame.gameover(this);
    };

    TapRace.prototype.receiveBroadcast = function(event, data, player_id) {
      var holder, player, rand, table, tds, _i, _j, _len, _len1, _ref, _ref1, _results,
        _this = this;
      if (player_id != null) {
        if (event === 'player: scored') {
          _ref = this.players;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            player = _ref[_i];
            if (player.id === player_id) {
              table = this.el.find("#tap-race-players #score-table-" + player_id);
              _results.push((function() {
                var _results1;
                _results1 = [];
                while (data.number > player.currentNumber) {
                  tds = table.find("td").not(".no-background");
                  rand = Math.floor(Math.random() * tds.length);
                  tds.eq(Math.floor(Math.random() * tds.length)).addClass('no-background');
                  player.currentNumber++;
                  break;
                }
                return _results1;
              })());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        } else if (event === 'player: done') {
          _ref1 = this.players;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            player = _ref1[_j];
            if (player.id === player_id) {
              player.done = true;
              player.time = data.time;
              holder = this.el.find("#score-table-holder-" + player_id);
              holder.find("table").fadeOut(500, function() {
                var elem;
                elem = _.template(App.Templates.TapRace.other_done, {
                  time: data.time / 1000
                });
                elem = $(elem);
                elem.hide();
                holder.html(elem);
                return elem.fadeIn(500);
              });
            }
          }
          if (this.allPlayersDone()) {
            return setTimeout((function() {
              return _this.calculateScores();
            }), 3000);
          }
        }
      }
    };

    TapRace.prototype.allPlayersDone = function() {
      var player, _i, _len, _ref;
      _ref = this.players;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        if (!player.done) {
          return false;
        }
      }
      return true;
    };

    TapRace.prototype.calculateScores = function() {
      var _this = this;
      this.players.sort(function(a, b) {
        if (a.time < b.time) {
          -1;
        }
        if (a.time > b.time) {
          return 1;
        } else {
          return 0;
        }
      });
      this.el.find(".top-half > div").fadeOut(500);
      this.el.find(".score-table-holder > div").fadeOut(500);
      setTimeout((function() {
        return _this.fillSpots();
      }), 500);
      return setTimeout((function() {
        return _this.gameover();
      }), 2500);
    };

    TapRace.prototype.fillSpots = function() {
      var elem, half, holder, index, player, _i, _len, _ref, _results;
      _ref = this.players;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        player = _ref[index];
        player.spot = index + 1;
        if (player.spot === 1) {
          player.score = 10;
        }
        if (player.spot === 2) {
          player.score = 5;
        }
        if (player.spot === 3) {
          player.score = 3;
        }
        if (player.spot === 4) {
          player.score = 1;
        }
        if (player.id === App.player_id) {
          this.score = player.score;
          half = this.el.find(".top-half");
          elem = _.template(App.Templates.TapRace.final, {
            spot: player.spot
          });
          elem = $(elem);
          elem.hide();
          half.html(elem);
          _results.push(elem.fadeIn(500));
        } else {
          holder = this.el.find("#score-table-holder-" + player.id);
          elem = _.template(App.Templates.TapRace.final, {
            spot: player.spot
          });
          elem = $(elem);
          elem.hide();
          holder.html(elem);
          _results.push(elem.fadeIn(500));
        }
      }
      return _results;
    };

    return TapRace;

  })(App.Minigames.Default);

  App.metagame.addMinigame(App.Minigames.TapRace);

}).call(this);
