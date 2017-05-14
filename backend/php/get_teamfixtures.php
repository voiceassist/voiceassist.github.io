<?php
include('league_ids.php');
include('base_urls.php');

if(!isset($_POST["t_id"])) {
	$team_id = 66;
	$team_name = "Manchester United FC";
	$league_code = 398;
	$team_code = "MUFC";
	$filter = -1;
}
else {
	$team_id = $_POST["t_id"];
	$team_name = $_POST["t_name"];
	$league_code = $_POST["l_code"];
	$team_code = $_POST["t_code"];
	$filter = $_POST["filter"];
}

$scores_endpoint = "teams/" . $team_id . "/fixtures";

if($filter != -1) {
	$filter = explode("+", $filter);
	$timeFrame = $filter[0];
	$timeFrame_val = $filter[1];
	$scores_endpoint .= "?timeFrame=" . $timeFrame . $timeFrame_val;
	//var_dump($scores_endpoint);
	//die();
}

$uri = $BASE_URL . $scores_endpoint;

$response = file_get_contents($uri, false, stream_context_create($reqPrefs));

$fixtures = json_decode($response);

echo json_encode($fixtures, JSON_PRETTY_PRINT);

?>
