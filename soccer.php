<?php
ini_set("allow_url_fopen", 1);
header('Content-Type: application/json');

// $uri = 'http://api.football-data.org/v1/competitions/430/teams';
// $reqPrefs = array();
// $reqPrefs['http']['method'] = 'GET';
// $reqPrefs['http']['header'] = 'X-Auth-Token: 37ab2f6b4dc84596a30758c2cae76f6f';
// $stream_context = stream_context_create($reqPrefs);

// //var_dump($stream_context);
// $response = file_get_contents($uri, false, stream_context_create($reqPrefs));
// $fixtures = json_decode($response);

// echo json_encode($fixtures, JSON_PRETTY_PRINT);
///v1/competitions/{id}/leagueTable

// create curl resource
// $ch = curl_init();

// // set url
// curl_setopt($ch, CURLOPT_URL, "http://api.football-data.org/v1/competitions/354/fixtures/?matchday=22");

// //return the transfer as a string
// curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
// curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');

// // $output contains the output string
// $output = curl_exec($ch);
// var_dump($output);
// die();
// // close curl resource to free up system resources
// curl_close($ch); 

include('league_ids.php');

$LIVE_URL = "http://soccer-cli.appspot.com/";
$BASE_URL = "http://api.football-data.org/alpha/";

$api_key = "37ab2f6b4dc84596a30758c2cae76f6f";

$league = "PL";
$id = $league_ids[$league];
$reqPrefs = array();
$reqPrefs['http']['method'] = 'GET';
$reqPrefs['http']['header'] = 'X-Auth-Token: ' . $api_key;

$uri = "http://api.football-data.org/alpha/soccerseasons/" . $id . "/leagueTable";

$response = file_get_contents($uri, false, stream_context_create($reqPrefs));
$fixtures = json_decode($response);


echo json_encode($fixtures, JSON_PRETTY_PRINT);
var_dump($fixtures);



die();


?>