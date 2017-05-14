<?php

$LIVE_URL = "http://soccer-cli.appspot.com/";
$BASE_URL = "http://api.football-data.org/alpha/";

$SPOTIFY_URL = "http://api.spotify.com/v1/search?";

$GOOGLE_URL = "https://maps.googleapis.com/maps/api/geocode/";

$BITLY_API_KEY = "R_18e717a13cea4bbb9cb1ed3630fd362e";
$login = "a6prasad";

$api_key = "37ab2f6b4dc84596a30758c2cae76f6f";
//$GOOGLE_API_KEY = "AIzaSyDWIUR0cIWPzT2y3ddK5cjTQ-oAxFNVTCI";
$GOOGLE_API_KEY = "AIzaSyBxt028QiYlnlj0FjF8v2O1nXdzqHvbDR4";


$reqPrefs = array();
$reqPrefs['http']['method'] = 'GET';
$reqPrefs['http']['header'] = 'X-Auth-Token: ' . $api_key;

?>