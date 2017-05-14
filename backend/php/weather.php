<?php
// Enable allow_url_fopen
ini_set("allow_url_fopen", 1);
header('Content-Type: application/json');

$api_key = "00844f88de2a411faf325022171303";

$api_site = "http://api.apixu.com/v1/current.json?key=";

// Search allows postal codes, cities or countries
$search_query = "&q=";

// Harcoded $search_query for now
//$search_val = "M2J3X1";
$search_val = urlencode($_POST["input"]);


$endpoint = $api_site . $api_key . $search_query . $search_val;


$json = file_get_contents($endpoint);
//$json = file_get_contents("http://api.apixu.com/v1/current.json?key=00844f88de2a411faf325022171303&q=torontoontario");
// var_dump($json);
// die();

$json = json_decode($json);
echo json_encode($json, JSON_PRETTY_PRINT);

?>