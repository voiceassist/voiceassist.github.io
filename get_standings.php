<?php 

include('league_ids.php');
include('base_urls.php');

if(!isset($_POST["input"])) {
	$league = "PL";
}
else {
	$league = $_POST["input"];
}

$league_ID = $league_ids[$league];

$standings_endpoint = "soccerseasons/" . $league_ID . "/leagueTable";

$uri = $BASE_URL . $standings_endpoint;

$response = file_get_contents($uri, false, stream_context_create($reqPrefs));
$fixtures = json_decode($response);

echo json_encode($fixtures, JSON_PRETTY_PRINT);

?>