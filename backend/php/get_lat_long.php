<?php
include('base_urls.php');

if(!isset($_POST["address"])) {
	$address = "";
}
else {
	$address = $_POST["address"];
}

$address = urlencode($address);
$uri = $GOOGLE_URL . "json?address=" . $address . "&key=" . $GOOGLE_API_KEY;

$response = file_get_contents($uri);
$response = json_decode($response);

echo json_encode($response, JSON_PRETTY_PRINT);


?>