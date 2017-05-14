var audio = document.createElement("audio");
var map, infowindow;
var locationType = "", locationHeading = "";
var position = {};
var timeout;
// Set the option based on the key word as given by the input
function setOption(word) {
	var opt = "";
	console.log(word);
	// Key Word "search", gets highest preference
	// over anything
	if(word.includes("search")) {
		opt = "S";
	}
	else if(word.includes("weather")) {
		opt = "W";
	}
	else if(word.includes("soccer") || word.includes("football")) {
		opt = "F";
	}
	else if(word.includes("information") || word.includes("wiki") || word.includes("wikipedia") || word.includes("info")) {
		opt = "I";
	}
	else if(word.includes("play")) {
		opt = "P";
	}
	else if(word.includes("show me") || word.includes("location") || word.includes("near me")) {
		opt = "L";
	}
	else if(word.includes("directions from") || word.includes("direction")) {
		opt = "D";
	}
	else {
		opt = "N";
	}
	return opt;
}

function sanitizeQuery(query) {
	query = query.replace(".", "");
	query = query.replace(":", "");
	query = query.replace(";", "");
	return query;
}

function unspecifiedOption(query) {
	var queryArr = [];
	queryArr = query.split(" ");
	var genericString = "";
	var header = "Couldn't quite recognize that command. Here's a search link for it.";
	for(var i = 0 ; i < queryArr.length ; i++) {
		genericString += queryArr[i] + " ";
	}
	getGoogleSearchResults(genericString, header);
}

// Google search 

function parseSearchQuery(query) {
	var queryArr = [];
	queryArr = query.split(" ");
	var searchString = "";
	console.log(queryArr);
	var header = "Showing Search Query";
	for(var i = 1 ; i < queryArr.length ; i++) {
		searchString += queryArr[i] + " ";
	}
	// searchString = encodeURI(searchString);
	console.log(searchString);
	getGoogleSearchResults(searchString, header);
}

function getGoogleSearchResults(searchStr, header) {
	console.log("Arrives here");
	var encodedSearchStr = encodeURI(searchStr);
	// If popups are not enabled, show the shortened url along
	// with the query, and ask user to enable it

	$.ajax({
		url: "backend/php/shorten_url.php",
		data: { searchQuery : encodedSearchStr },
		type: "POST",
		dataType: "json",
		success: function(result) {
			console.log("Result:", result);
			console.log("Result length", result.results);
			if(result != "") {
				$("#results_heading").attr('id', 'gsearch_heading');
				$(".result_heading").html(header + " (Enable pop-ups to open the tab directly!)");
				$("#results").attr('id', 'gsearch_results');
			
				var searchTable = '<table class="table" id="gsearch_table">';

				searchTable += '<tbody>';

				searchTable += generateGoogleSearchRowsHTML(searchStr, result);

				// End tbody and table
				searchTable += '</tbody>';
				searchTable += '</table>';

				$("#gsearch_results").append(searchTable);
				$("#gsearch_table").addClass("gsearch_table");
				console.log(searchTable);
			}
			else {
				console.log("Nothing");
			}		
		},
		failure: function(result) {
			console.log("Failure: ", result);
		}
	});
}

// Parse the weather query in order to prepare it for input to API
function parseWeatherQuery(query) {
	var queryArr = [];
	// Get the entire input
	var input = query.split(" ");

	// Parse the key word
	var keyWord = input[0];
	// Push the keyword into the array
	queryArr.push(keyWord);
	
	// Join the rest of the input in one string
	var query = input.slice(1, input.length).join(" ");
	query = stringToNumber(query);
	// Push the weather idenitifier
	queryArr.push(query);
	return queryArr;	
}

// Convert string representation of number to actual number itself for 
// the postal code option
function stringToNumber(str) {
	// Only have to check for Postal Code, which would be the second input
	str = str.toLowerCase();
	var replacedFlag = 0;
	var input = str.split(" ");
	var numStrings = ["n/a/", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
	for(var i = 0 ; i < input.length ; i++) {
		if(numStrings.indexOf(input[i]) != -1) {
			replacedFlag = 1;
			var indexFound = numStrings.indexOf(input[i]);
			input[i] = indexFound.toString();
		}
	}
	if(replacedFlag == 1) {
		return input.join("");
	}
	else {
		return input.join(" ");
	}
}

function getWeatherInformation(query) {
	var input = query[1];

	//Construct ajax request to weather php endpoint
	$.ajax({
		url: "backend/php/weather.php",
		data: { input : input },
		type: "POST",
		dataType: "json",
		success: function(result) {
			console.log("Result:", result);

			if($("#results_heading").attr("id") == "weather_heading") {
				$("#results_heading").removeAttr('id', 'weather_heading');
			}

			$("#results_heading").attr('id', 'weather_heading');
			
			$(".result_heading").addClass("weather_heading");
			$(".result_heading").removeClass("result_heading");

			$(".weather_heading").html("Weather for " + input + ", " + result.location.country);

			$("#results").attr('id', 'weather_results');
			
			if($("#weather_table").attr("id") == "weather_table") {
				$("#weather_table").remove();
			}

			var weather_table = '<table class="table" id="weather_table">';
			weather_table += '<tbody>';

			weather_table += returnWeatherRowStructure("temperature", "Temperature", result.current.temp_c, "&deg C");
			
			weather_table += returnWeatherRowStructure("feels_like", "Feels Like ", result.current.feelslike_c, "&deg C");
			
			weather_table += returnWeatherRowStructure("humidity", "Humidity", result.current.humidity, "%");

			weather_table += returnWeatherRowStructure("wind_speed", "Wind Speed", result.current.wind_kph, "kph");

			weather_table += '</tbody';

			weather_table += '</table>';

			console.log(weather_table);
			
			$("#weather_results").append(weather_table);
			$("#weather_table").addClass("weather_table");
		},
		failure: function(result) {
			console.log("Failure: ", result);
		}
	});
}
   

$("#record_button").click(function() {
	$("#stop-record").addClass("stop-record");
	$("#record_button").addClass("start-record");
	if($("#record_button").is(".start-record")) {
		$("#record_button").attr("disabled", "disabled");
	}
	clearHTML();
});

$("#stop-record").click(function() {
	$("#stop-record").removeClass("stop-record");
	$("#record_button").removeClass("start-record");
	$("#record_button").removeAttr("disabled");
	stopRecording();
});

/* Soccer Stuff starts here */
function parseFootballQuery(query) {
	var queryArr = [];
	queryArr = query.split(" ");
	var keyWord = queryArr[0]; // Either Soccer / Football

	var identifier = queryArr[1];
	identifier = identifier.toLowerCase();
	// Standings option requested
	if(identifier.includes("table") || identifier.includes("standings")) {
		// Identify the league requested
		var league = "";
		for(var i = 2 ; i < queryArr.length ; i++) {
			league += queryArr[i];
		}
		getStandings(league);
	}
	else if(identifier.includes("fixtures")) {
		// Usage: Soccer fixtures timeframe <next/previous> <team name>
		// Command : Soccer fixtures next/previous number teamname
		console.log(identifier);
		var timeFrame = queryArr[2];
		var teamName = "";
		var time = "";
		console.log(timeFrame, queryArr[3], typeof parseInt(queryArr[3]) == "number");
		if((timeFrame.includes("next") || timeFrame.includes("previous")) && (typeof parseInt(queryArr[3]) == "number")) {
			// Pull up fixtures with the time frame option
			for(var i = 4; i < queryArr.length ; i++) {
				teamName += queryArr[i] + " ";
			}
			if(timeFrame.includes("next")) {
				time = "n+" + queryArr[3].toString();
				console.log(teamName, time, typeof queryArr[3], queryArr[3]);
			}
			else if(timeFrame.includes("previous")) {
				time = "p+" + queryArr[3].toString();
				console.log("Previous fixtures");
				console.log(teamName, time);
			}
			getTeamInformation(teamName, time);
		}
		else {
			console.log("All Fixtures");
			for(var i = 2 ; i < queryArr.length ; i++) {
				teamName += queryArr[i] + " ";
			}
			console.log(teamName);
			getTeamInformation(teamName, -1);			
		}
	}
	else if(identifier.includes("score")) {
		console.log(identifier);
		var live = 0;
		for(var i = 2 ; i < queryArr.length ; i++) {
			if(queryArr[i].toLowerCase() == "live") {
				live = 1;
				break;
			}
		}
		if(live) {
			getLiveScores();
		}
		else {
			console.log("Couldn't get live scores. Please try the command again");
		}
	}
	else {
		console.log("TBI!");
	}
}

function getLiveScores() {
	$.ajax({
		url: "backend/php/get_live_scores.php",
		dataType: "json",
		success: function(result) {
			console.log("Result:", result);
			console.log(result.games.length);
			if(result.games.length <= 0) {
				/* No games playing right now in the major leagues */
				$("#results_heading").attr('id', 'soccer_heading');
				$(".result_heading").html("There is no game being played right now in any of Europe's major leagues");
			}
			else {
				/* Do nothing for now. See how the response is when live games are played */
				console.log(result);
				$("#results_heading").attr('id', 'soccer_heading');
				$(".result_heading").html("Live Soccer Scores");
				$("#results").attr('id', 'soccer_results');
				var soccerTable = '<table class="table" id="soccer_table">';
				soccerTable += '<tbody>';

				// Start row for headings 
				soccerTable += '<tr>';
				// Generate headings 
				soccerTable += generateLiveScoresHeadingsHTML();
				// End row for headings
				soccerTable += '</tr>';

				// Generate data by looping through various teams
				for(var i = 0 ; i < result.games.length ; i++) {
					if(result.games[i].time.substr("-1") == "'") {
						soccerTable += generateLiveScoresRowsHTML(result.games[i], i, 1);
					}
					else {
						soccerTable += generateLiveScoresRowsHTML(result.games[i], i, 0);						
					}
				}

				// End tbody and table
				soccerTable += '</tbody>';
				soccerTable += '</table>';

				$("#soccer_results").append(soccerTable);
				// Change the class, put in another one as you have to change the css for this
				$("#soccer_table").addClass("soccer_table");
				$("#soccer_table").removeClass("weather_table");

				console.log(soccerTable);
			}
		},
		failure: function(result) {
			console.log("Failure: ", result);
		}
	});	
}


function getStandings(league) {
	var league = league.toUpperCase();
	console.log(league);
	$.ajax({
		url: "backend/php/get_standings.php",
		data: { input : league.toUpperCase()},
		type: "POST",
		dataType: "json",
		success: function(result) {
			console.log("Result:", result);

			$("#results_heading").attr('id', 'soccer_heading');
			
			$(".result_heading").html("League Table");

			$("#results").attr('id', 'soccer_results');
			var soccerTable = '<table class="table" id="soccer_table">';
			soccerTable += '<tbody>';

			// Start row for headings 
			soccerTable += '<tr>';
			// Generate headings 
			soccerTable += generateFootballStandingsHeadings();
			// End row for headings
			soccerTable += '</tr>';

			// Generate data by looping through various teams
			for(var i = 0 ; i < result.standing.length ; i++) {
				soccerTable += generateFootballStandingsRows(result.standing[i]);
			}

			// End tbody and table
			soccerTable += '</tbody>';
			soccerTable += '</table>';

			$("#soccer_results").append(soccerTable);
			// Change the class, put in another one as you have to change the css for this
			$("#soccer_table").addClass("soccer_table");
			$("#soccer_table").removeClass("weather_table");
			console.log(soccerTable);

			console.log($("#results_heading").attr("id"));
		},
		failure: function(result) {
			console.log("Failure: ", result);
		}
	});
}


function getTeamInformation(team, filter) {
	//http://api.football-data.org/v1/teams/5/fixtures?timeFrame=n20
	$.ajax({
		url: "teams.json",
		success: function(result) {
			console.log("Result:", result);
			var totalTeams = result.teams;
			for(var i = 0 ; i < totalTeams.length ; i++) {
				// var 
				if(totalTeams[i].name.toLowerCase().includes(team.toLowerCase())) {
					var team_id = totalTeams[i].id;
					var league_id = totalTeams[i].league.id;
					var team_code = totalTeams[i].code;
					var team_name_full = totalTeams[i].name;
					break;
				}
			}
			console.log(team_id, league_id, team_code,team_name_full);
			getTeamFixtures(team_id, league_id, team_code, team_name_full, filter);
		},
		failure: function(result) {
			console.log("Failure: ", result);
		}
	});
}


function getTeamFixtures(id, l_id, t_code, t_name, filter) {
	$.ajax({
		url: "backend/php/get_teamfixtures.php",
		data: { t_id : id,
		        t_name: t_name,
		        l_code: l_id,
		        t_code: t_code,
		        filter: filter},
		type: "POST",
		dataType: "json",
		success: function(result) {
			console.log("Result:", result);

			$("#results_heading").attr('id', 'soccer_heading');
			$(".result_heading").html("Team Fixtures - " + t_name);
			$("#results").attr('id', 'soccer_results');
			var soccerTable = '<table class="table" id="soccer_table">';
			soccerTable += '<tbody>';

			// Start row for headings 
			soccerTable += '<tr>';
			// Generate headings 
			soccerTable += generateFixturesHeadingsHTML();
			// End row for headings
			soccerTable += '</tr>';
	
			// Generate data by looping through various teams
			for(var i = 0 ; i < result.fixtures.length ; i++) {
				soccerTable += generateFixturesRowsHTML(result.fixtures[i], i);
			}

			// End tbody and table
			soccerTable += '</tbody>';
			soccerTable += '</table>';
			$("#soccer_results").append(soccerTable);
			// Change the class, put in another one as you have to change the css for this
			$("#soccer_table").addClass("soccer_table");

		},
		failure: function(result) {
			console.log("Failure: ", result);
		}
	});
}

/* Song Stuff starts here */
function parseSongQuery(query) {
	var queryArr=[];
	queryArr = query.split(" ");
	var keyWord = queryArr[0]; // queryArr[0] = "play"
	var songName = "";
	var artistName = "";
	for(var i = 0 ; i < queryArr.length ; i++) {
		if(queryArr[i].toLowerCase() == "by") {
			songName = queryArr.slice(1, i).join(" ");
			artistName = queryArr.slice(i + 1, queryArr.length).join(" ");
			break;
		} 
	}
	if(artistName == "") {
		songName = queryArr.slice(1,queryArr.length).join(" ");
	}

	getSongSearchResults(songName, artistName);
	
}

function getSongSearchResults(song, artist) {
	console.log(song, artist);
	$.ajax({
		url: "backend/php/get_song_search.php",
		data: { song : song,
				artist: artist},
		type: "POST",
		dataType: "json",
		success: function(result) {
			console.log("Result:", result);
			playSong(result);
		},
		failure: function(result) {
			console.log("Failure: ", result);
		}
	});
}

function playSong(res) {
	res = res.tracks.items;
	console.log("Play song function ", res);
	var playing = false;
	if(res.length > 0) {
		for(var i = 0 ; i < res.length ; i++) {
			if(res[i].preview_url != null) {
				res = res[i];
				break;
			}
		}

		$("#results_heading").attr('id', 'songs_heading');
		$(".result_heading").html("Now Playing - " + res.name + " by " + res.artists[0].name);
		$("#results").attr('id', 'songs_results');
		var songsTable = '<table class="table" id="song_table">';

		songsTable += '<tbody>';

		songsTable += generateSongRowsHTML(res.external_urls.spotify, "Youtube link");

		// End tbody and table
		songsTable += '</tbody>';
		songsTable += '</table>';
		$("#songs_results").append(songsTable);
		$("#song_table").addClass("song_table");
		console.log(songsTable);
		audio.id = "current_song";
		var play_artist = res.artists[0].name;
		audio.src = res.preview_url;
		audio.play();
		playing = true;
	}
	else {
		// No songs to play
		console.log("No Song to Play");
		// Pull up a youtube search maybe?
	}
}

function returnWeatherRowStructure(id, heading, value, unit)
{
	var html = '<tr>';
	html += '<td class="weather_row_heading" id="'+id+'">' + heading + '</td>';
	html += '<td class="weather_row_value" id="'+id+'">' + value + ' ' + unit + '</td>';
	html += '</tr>';
	return html;
}      

function generateFootballStandingsHeadings() {
	// Columns are : position, team name, games played, wins, draws, losses, Goals For, Goals Against, Goal difference, points
	var html = '<td class="soccer_row_heading" id="soc_position">Pos</td>';
	html += '<td class="soccer_row_heading" id="soc_teamname">Team</td>';
	html += '<td class="soccer_row_heading" id="soc_gp">GP</td>';
	html += '<td class="soccer_row_heading" id="soc_wins">W</td>';
	html += '<td class="soccer_row_heading" id="soc_draws">D</td>';
	html += '<td class="soccer_row_heading" id="soc_losses">L</td>';
	html += '<td class="soccer_row_heading" id="soc_gf">GF</td>';
	html += '<td class="soccer_row_heading" id="soc_ga">GA</td>';
	html += '<td class="soccer_row_heading" id="soc_gd">GD</td>';
	html += '<td class="soccer_row_heading" id="soc_pts">Pts</td>';
	return html;
}

function generateFootballStandingsRows(res) {
	var html = '<tr>';
	html += '<td class="soccer_row_value" id="soc_position">'+res.position+'</td>';
	html += '<td class="soccer_row_value" id="soc_teamname">'+res.teamName+'</td>';
	html += '<td class="soccer_row_value" id="soc_gp">'+res.playedGames+'</td>';
	html += '<td class="soccer_row_value" id="soc_wins">'+res.wins+'</td>';
	html += '<td class="soccer_row_value" id="soc_draws">'+res.draws+'</td>';
	html += '<td class="soccer_row_value" id="soc_losses">'+res.losses+'</td>';
	html += '<td class="soccer_row_value" id="soc_gf">'+res.goals+'</td>';
	html += '<td class="soccer_row_value" id="soc_ga">'+res.goalsAgainst+'</td>';
	html += '<td class="soccer_row_value" id="soc_gd">'+res.goalDifference+'</td>';
	html += '<td class="soccer_row_value" id="soc_pts">'+res.points+'</td>';
	html += '</tr>';
	return html;
}

function generateLiveScoresHeadingsHTML() {
	var html = '<td class="soccer_row_heading" id="ser_no">#</td>';
	html += '<td class="soccer_row_heading" id="league_name">League</td>';
	html += '<td class="soccer_row_heading" id="home_team">Home Team</td>';
	html += '<td class="soccer_row_heading" id="score">Score</td>';
	html += '<td class="soccer_row_heading" id="away_team">Away Team</td>';
	// html += '<td class="soccer_row_heading" id="date_played">Date</td>';
	html += '<td class="soccer_row_heading" id="status">Status</td>';
	return html;
}
function generateLiveScoresRowsHTML(res, num_game, live_flag) {
	// Status 
	// 1. Finished
	// 2. Live
	// 3. To be Played
	var score = "";
	var status = "";
	if(live_flag == 1) {
		// Live game going on
		status = '<img src="http://cdn3.livescore.com/web2/img/flash.gif"></img> ' + res.time;
	}
	else {
		status = res.time;
	}
	if(res.goalsAwayTeam != -1 && res.goalsHomeTeam != -1) {
		score = res.goalsHomeTeam + " - " + res.goalsAwayTeam;
	}
	else {
		score = "TBA - TBA";
	}

	var html = '<tr>';
	html += '<td class="soccer_row_value" id="ser_no">'+(parseInt(num_game) + 1)+'</td>';
	html += '<td class="soccer_row_value" id="league_name">'+res.league+'</td>';
	html += '<td class="soccer_row_value" id="home_team">'+res.homeTeamName+'</td>';
	html += '<td class="soccer_row_value" id="score">'+score+'</td>';
	html += '<td class="soccer_row_value" id="away_team">'+res.awayTeamName+'</td>';
	html += '<td class="soccer_row_value" id="status">' + status + '</td>';
	html += '</tr>';
	return html;
}

function generateFixturesHeadingsHTML() {
	// Columns are 
	//  #, Home Team, Score, Score, Away Team, Date, Status
	var html = '<td class="soccer_row_heading" id="ser_no">#</td>';
	html += '<td class="soccer_row_heading" id="home_team">Home Team</td>';
	html += '<td class="soccer_row_heading" id="score">Score</td>';
	html += '<td class="soccer_row_heading" id="away_team">Away Team</td>';
	html += '<td class="soccer_row_heading" id="date_played">Date</td>';
	html += '<td class="soccer_row_heading" id="status">Status</td>';
	return html;
}

function generateSongRowsHTML(spot_link, youtube_link) {
	var html = '<tr>';
	html += '<td class="song_row">Spotify Link</td>';
	html += '<td class="song_row"><a class="gsearch_link" href="' + spot_link + '">Click to hear the song on Spotify</a></td>';
	html += '</tr>';
	/*html += '<tr>';
	html += '<td class="song_row">Youtube Link</td>';
	html += '<td class="song_row">' + "Youtube link to be added" + '</td>';
	html += '</tr>';*/
	return html;
}

function generateGoogleSearchRowsHTML(query, url) {
	var html = '<tr>';
	html += '<td class="search_row">' + '"' + query + '"' + '</td>';
	html += '<td class="search_row"><a class="gsearch_link" href="'+url+'" target="_blank">' + url + '</a></td>';
	html += '</tr>';
	return html;
}

function generateFixturesRowsHTML(res, serial_no) {
	
	var date = res.date.substr(0, res.date.indexOf("T"));
	if(res.status.toLowerCase() == "finished") {
		var score = res.result.goalsHomeTeam + " - " + res.result.goalsAwayTeam;
	}
	else {
		var score = "TBA - TBA";
	}
	var html = '<tr>';
	html += '<td class="soccer_row_value" id="ser_no">'+(parseInt(serial_no) + 1)+'</td>';
	html += '<td class="soccer_row_value" id="home_team">'+res.homeTeamName+'</td>';
	html += '<td class="soccer_row_value" id="score">'+score+'</td>';
	html += '<td class="soccer_row_value" id="away_team">'+res.awayTeamName+'</td>';
	html += '<td class="soccer_row_value" id="date_played">'+date+'</td>';
	html += '<td class="soccer_row_value" id="status">'+res.status+'</td>';
	html += '</tr>';
	return html;
} 


/*Clear on click*/
function clearHTML() {
	if($("#weather_heading").attr("id") == "weather_heading") {
		console.log("Cleared");
		$("#weather_table").remove();
		$(".weather_heading").html("");
		$(".weather_heading").addClass("result_heading");
		$(".weather_heading").removeClass("weather_heading");
		$("#weather_heading").attr("id", "results_heading");
	}
	if($("#gsearch_heading").attr("id") == "gsearch_heading") {
		console.log("Cleared Gsearch");
		$("#gsearch_table").remove();
		$(".result_heading").html("");
		$("#gsearch_heading").attr("id", "results_heading");
		$("#gsearch_results").attr("id", "results");
	}
	if($("#location_heading").attr("id") == "location_heading") {
		console.log("Cleared Location");
		$(".result_heading").html("");
		$("#location_heading").attr("id", "results_heading");
		$("#map-area").remove();
		$("#about").removeClass("map-section");
	}
	if($("#songs_heading").attr("id") == "songs_heading") {
		console.log("Cleared Songs");
		$("#song_table").remove();
		$(".result_heading").html("");
		$("#songs_heading").attr("id", "results_heading");
		// audio.src = "";
	}
	if($("#songs_results").attr("id") == "songs_results") {
		$("#songs_results").attr("id", "results");
	}
	if($("#soccer_heading").attr("id") == "soccer_heading") {
		$("#soccer_table").remove();
		$("#soccer_heading").attr("id","results_heading");
		$(".result_heading").html("");
	}
	if($("#weather_results").attr("id") == "weather_results") {
		console.log("Cleared");
		$("#weather_results").attr("id", "results");
	}
	if($("#soccer_results").attr("id") == "soccer_results"){
		$("#soccer_results").attr("id", "results");
	}
}

// Google maps stuff

function initMap(pos) {
    
	//var default = {lat: -33.867, lng: 151.195};
	var myLocation = {lat: pos.lat, lng: pos.lng};

	if(document.getElementById("map-area") != null) {
		// Element already exists remove it and recreate it
		$("#map-area").remove();
		$("#about").removeClass("map-section");
	}
	var mapDiv = $("<div id='map-area'></div>");
	$("#about").append(mapDiv);
	// Add CSS classes to the section and mapDiv
	$("#about").addClass("map-section");
	$("#map-area").addClass("map-area");
	// Add Heading
	$("#results_heading").attr('id', 'location_heading');
	$(".result_heading").html(locationHeading);
	map = new google.maps.Map(document.getElementById('map-area'), {
	  center: myLocation,
	  zoom: 12
	});

	infowindow = new google.maps.InfoWindow();
	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
	  location: myLocation,
	  radius: 5000,
	  type: [locationType]
	}, callback);
}

	function callback(results, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
		  for (var i = 0; i < results.length; i++) {
		    createMarker(results[i]);
		  }
		}
	}

	function createMarker(place) {
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
		  map: map,
		  position: place.geometry.location
		});

		google.maps.event.addListener(marker, 'click', function() {
		  infowindow.setContent(place.name);
		  infowindow.open(map, this);
		});
	}

// GeoLocation Services
function geoLocation() {
	if("geolocation" in navigator) {
		// Geolocation Avaliable
		navigator.geolocation.getCurrentPosition(success, error, options);
	}
	else {
		// Geolocation not available
		console.log("Location not available");
	}
}

function error() {
	console.log("Location doesn't work");
}
var options = {
  enableHighAccuracy: true, 
  maximumAge        : 30000, 
  timeout           : 5000
};

function success(pos) {
  var crd = pos.coords;
  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
  position = {lat: crd.latitude, lng: crd.longitude, accuracy: crd.accuracy};
  console.log(position);

  // Call initMap here as geoLocation is done asynchronously
  initMap(position);
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

function parseLocationQuery(query) {
	var queryArr=[];
	queryArr = query.split(" ");
	var type = "", address = "", typeSanitized = "";
	var i = 0, locationFlag = 0;
	// Iterate through to figure out the "type" to search
	for( ; i < queryArr.length ; i++) {
		if(queryArr[i].toLowerCase().includes("restaurants") 
			|| queryArr[i].toLowerCase().includes("places to eat")
			|| queryArr[i].toLowerCase().includes("food places")) {
			type = "restaurant";
			typeSanitized = "Restaurants";
			break;
		}
		else if(queryArr[i].toLowerCase().includes("hospital")
			|| queryArr[i].toLowerCase().includes("clinic")) {
			type = "hospital";
			typeSanitized = "Hospitals";
			break;
		}
		else if(queryArr[i].toLowerCase().includes("subway")
			|| queryArr[i].toLowerCase().includes("subway station")) {
			type = "subway_station";
			typeSanitized = "Subway Stations";
			break;
		}
		else if(queryArr[i].toLowerCase().includes("theater")
			|| queryArr[i].toLowerCase().includes("cinema")) {
			type = "movie_theater";
			typeSanitized = "Movie Theaters";
			break;
		}
		else if(queryArr[i].toLowerCase().includes("store")) {
			type = "store";
			typeSanitized = "Stores and Markets";
			break;
		}
		/*
		else if(queryArr[i].toLowerCase().includes("me")) {
			type = queryArr[i+1];
			// debugger;
			break;
		}*/
	}
	if(type == "") {
		for(i = 0 ; i < queryArr.length ; i++) {
			if(queryArr[i].toLowerCase().includes("me")) {
				type = queryArr[i+1];
				typeSanitized = type;
				break;
			}		
		}
	}
	locationType = type;
	console.log("Global location : ", locationType);
	if(queryArr[queryArr.length - 1].toLowerCase().includes("location")
	|| queryArr[queryArr.length - 1].toLowerCase().includes("me")) {
	    locationFlag = 1;
		geoLocation();
		getLocationResultHeading(typeSanitized, locationFlag, "");
	}
	else {
		for( ; i < queryArr.length - 1;  i++) {
			if(queryArr[i].toLowerCase().includes("near")) {
				address = queryArr.slice(i+1, queryArr.length).join(" ");
				break;
			}
		}
		convertAddressToLatLong(address, locationType, typeSanitized, locationFlag);
	}


}


function convertAddressToLatLong(addr, type, typeSanitized, locFlag) {
	
	$.ajax({
		url: "backend/php/get_lat_long.php",
		data: { address : addr },
		type: "POST",
		dataType: "json",
		success: function(result) {
			console.log(addr);
			console.log("Result:", result);
			result = result.results[0];
			var pos = {lat: result.geometry.location.lat, lng: result.geometry.location.lng};
			getLocationResultHeading(typeSanitized, locFlag, result.formatted_address);
			initMap(pos);
		},
		failure: function(result) {
			console.log("Failure: ", result);
		}
	});	
}

function getLocationResultHeading(str, flag, addr) {
	var html = "";
	if(flag) {
		html += "Showing " + str + " near your location (5km Radius)";
	}
	else {
		html += "Showing " + str + " near " + addr + " (5km Radius)";
	}
	locationHeading = html;
}

function availableCommands() {
	/*
	1. Weather
	    1.1 Weather for a city : Weather <City>
	    1.2 Weather for a country : Weather <Country>
	    1.3 Weather for a postal code: Weather <Postal Code>
	2. Soccer 
		2.1 Soccer table for league: Soccer table/standings <League Code>
			2.1.1 List of available leagues: league_ids.php
		2.2 Soccer Fixtures : Soccer Fixtures <Team name>
		2.3 Soccer Fixtures Upcoming/Previous : soccer fixtures next/previous <num of days to go back or forward> <teamname>
		2.4 Live Soccer Scores : soccer scores live
	3. Information
		3.1 Bring up wikipedia articles based on search : TBI
	4. Play Songs
		4.1 Play song: play <Song name>
		4.2 Play song with artist: play <Song name> by <Artist>
		4.3 Get Spotify to suggest playlist of songs?? TBI
	5. Google Places Integration
		5.1 Places near my location : Show me {restaurants, stores, cinemas, subway stations, hospitals} near my location
		5.2 Places near an address : Show me {restaurants, stores, cinemas, subway stations, hospitals} near {address}
	*/
}



function initDirectionsMap(origin, destination, travelType) {
  if(document.getElementById("map-area") != null) {
  	// Element already exists remove it and recreate it
  	$("#map-area").remove();
  	$("#about").removeClass("map-section");
  }
  var mapDiv = $("<div id='map-area'></div>");
  $("#about").append(mapDiv);

  // Add CSS classes to the section and mapDiv
  $("#about").addClass("map-section");
  $("#map-area").addClass("map-area");

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map-area'), {
    zoom: 7,
    center: {lat: 43.653226, lng: -79.3831843}
  });
  directionsDisplay.setMap(map);

  calculateAndDisplayRoute(directionsService, directionsDisplay, origin, destination, travelType);

}

function calculateAndDisplayRoute(directionsService, directionsDisplay, org, dest, travelType) {
  directionsService.route({
    origin: org,
    destination: dest,
    travelMode: travelType
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
      console.log(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function parseDirectionQuery(query) {
	var queryArr=[];
	queryArr = query.split(" ");
	var i = 0, j = 0;
	var travelType = "";
	var fromAddress = "", toAddress = "";
	// This parsing needs to change
	// It is okay for now but has to be improved
	for( ; i < queryArr.length ; i++) {
		if(queryArr[i].toLowerCase() == "from") {
			break;
		}
	}
	j = i;
	for( ; j < queryArr.length ; j++) {
		if(queryArr[j].toLowerCase() == "to") {
			break;
		}
	}
	fromAddress = queryArr.slice(i+1,j).join(" ");
	i = j+1;
	for( j = j + 1; j < queryArr.length ; j++) {
		if(queryArr[j].toLowerCase() == "by"
		   || queryArr[j].toLowerCase().includes("bye")) {
			break;
		}
	}
	toAddress = queryArr.slice(i,j).join(" ");
	travelType = queryArr[j+1];
	if(travelType == ""
		|| (typeof travelType == undefined)) {
		travelType = "car";
	}
	console.log(travelType);
	travelType = getTravelTypeOption(travelType);
	console.log("From Address : " , fromAddress);
	console.log("To Address : ", toAddress);
	console.log("Travel Mode : " , travelType);
	
	// initDirectionsMap("140 Edmonton Drive, Ontario", "Waterloo, ON", "TRANSIT");
	initDirectionsMap(fromAddress, toAddress, travelType);

}

function getTravelTypeOption(type) {
	type = type.toLowerCase();
	if(type == "driving" || type == "car" || type == "drive") {
		return "DRIVING";
	}
	else if(type == "bus" || type == "subway") {
		return "TRANSIT";
	}
	else if(type == "walk" || type == "walking") {
		return "WALKING";
	}
	else if(type == "cycle" || type == "bicycle"
		    || type == "cycling" || type == "bike") {
		return "BICYCLING";
	}
	else {
		//Default -> Driving
		return "DRIVING";
	}
}