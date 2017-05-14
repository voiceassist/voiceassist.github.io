<?php

include('league_ids.php');
include('base_urls.php');


if(!isset($_POST["searchQuery"])) {
	$search_query = -1;
}else {
	$search_query = $_POST["searchQuery"];
}

if($search_query == -1) {
	echo json_encode("-1");
}
else {
	$long_url = "http://google.ca/?gws_rd=ssl#q=";
	$long_url .= $search_query;
	$format = "json";
	$version = "3";
}

$bitly = 'http://api.bit.ly/shorten?version='.$version.'&longUrl='.urlencode($long_url).'&login='.$login.'&apiKey='.$BITLY_API_KEY.'&format='.$format;

$response = json_decode(file_get_contents($bitly));


$shortened_url = $response->results->$long_url->shortUrl;

echo json_encode($shortened_url, JSON_PRETTY_PRINT);

?>