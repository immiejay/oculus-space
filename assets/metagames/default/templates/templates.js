// Generated by CoffeeScript 1.4.0
(function() {

  App.Metagame.Default = {};

  App.Metagame.Default.Templates = {
    main_view: '<div id="waiting_room"></div>\n<div id="intro"></div>\n<div id="pregame"></div>\n<div id="scoreboard"></div>\n<div id="next_game"></div>\n<div id="countdown"></div>',
    waiting_room: '<h1>Waiting for more players...</h1>\n<h4>\n  <% if (players.length == 1) { %>\n    You&rsquo;re all alone right now! :(\n  <% } else if (players.length == 2) { %>\n    Hooray, a friend has joined you!\n  <% } else if (players.length == 3) { %>\n    You&rsquo;ve got two friends to play with!\n  <% } else if (players.length == 4) { %>\n    Sweet, four players! This should be fun.\n  <% } else if (players.length == 5) { %>\n    SO MANY PEOPLE. I&rsquo;M FEELING OVERWHELMED.\n  <% } else if (players.length == 6) { %>\n    Look at all these people! It&rsquo;s like the Brady Bunch in here.\n  <% } else if (players.length > 6) { %>\n    Y&rsquo;all ready to PARTY?!?!?\n  <% } %>\n</h4>\n<ul class="player_blocks">\n  <% _.each(players, function(player, index){ %>\n    <% if (index <= 4 || players.length <= 5) { %>\n      <li>\n        <% if (index == 4 && players.length > 5) { %>\n          <br><br>\n          + <%= (players.length - 4) %> others\n        <% } else { %>\n          <div class="color" style="background: <%= player.color%>">\n            <img src="/assets/metagames/default/images/person.png">\n          </div>\n          <%= player.name %>\n        <% } %>\n      </li>\n    <% } %>\n  <% }) %>\n</ul>\n<div style="font-size: 24px">\n  Ready to start playing?\n</div>\n<button>Let&rsquo;s go!</button>',
    intro: '<h1>Let\'s get started!</h1>\n<h4>Loading your first game...</h4>\n<img src="/assets/metagames/default/images/ajax.gif" style="margin: 40px 0 90px">\n<div class="next_game" style="display: none"></div>',
    pregame: '<h1><%= name %></h1>\n<div class="instructions">\n  <h4>Instructions</h4>\n  <%= instructions %>\n</div>\n<div style="font-size: 24px">\n  Waiting for players...\n</div>\n<div class="ready-for-minigame">\n  <% _.each(players, function(player){ %>\n    <div class="player <%= player.ready ? "ready" : "" %>" style="background: <%= player.color %>">\n      <%= player.ready ? "&#10003;" : "&times;" %>\n    </div>\n  <% }) %>\n</div>\n<% if (ready){ %>\n  <button disabled=\'disabled\'>Waiting...</button>\n<% } else { %>\n  <button>I\'m ready!</button>\n<% } %>',
    countdown: 'Game starting in <span>3</span>...',
    next_game_headers: ["Another game, coming up!", "The battle rages on!", "Ready for more?"],
    next_game: '<h1><%= App.Metagame.Default.Templates.next_game_headers[Math.floor(Math.random()*App.Metagame.Default.Templates.next_game_headers.length)] %></h1>\n<h4>Loading your next game...</h4>\n<img src="/assets/metagames/default/images/ajax.gif" style="margin: 40px 0 90px">\n<div class="next_game">\n  <%= currentMinigame ? currentMinigame.constructor.NAME : "" %>\n</div>',
    scoreboard: '<h1>Scoreboard</h1>\n<table class="scoreboard">\n  <tr>\n    <th></th>\n    <th class="name">Player</th>\n    <th class="score">Total score</th>\n    <th class="result">Result</th>\n  </tr>\n  <tbody>\n    <% _.each(players, function(player, index){ %>\n      <tr class="player_<%= index %>" data-id="<%= player.id %>">\n        <td><div class="color" style="background: <%= player.color %>"></div></td>\n        <td class="name"><%= player.name %></td>\n        <td class="score"><span><%= player.score %></span> points</td>\n        <td class="result">+ <%= player.minigame_score %></td>\n      </tr>\n    <% }) %>\n  </tbody>\n</table>'
  };

}).call(this);
