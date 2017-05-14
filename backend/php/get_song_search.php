<?php
include('base_urls.php');
if(!isset($_POST["song"])
	&& !isset($_POST["artist"])) {
	$song = "";
	$artist = "";
}
else if(!isset($_POST["artist"])
	 && isset($_POST["song"])) {
	$song = $_POST["song"];
	$artist = "";
}
else if(!isset($_POST["song"])
	    && isset($_POST["artist"])) {
	$artist = "";
	$song = "";
}
else {
	$song = $_POST["song"];
	$artist = $_POST["artist"];
}

if($song == "" && $artist == "") {
	echo json_encode("Couldn't quite catch that! Please try again!");
}
else {
	if($artist == "") {
		$query = $song;
	}
	else {
		$query = $song . " artist:" . $artist;
	}
	$endpoint = "query=" . urlencode($query) . "&type=track&market=US";
	$endpoint = $SPOTIFY_URL . $endpoint;
	
	$response = file_get_contents($endpoint);
	$response = json_decode($response);
	echo json_encode($response);
}

?>