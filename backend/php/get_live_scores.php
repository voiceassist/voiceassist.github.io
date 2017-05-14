<?php
include('base_urls.php');
$uri = $LIVE_URL;
$response = file_get_contents($uri, false, stream_context_create($reqPrefs));
$fixtures = json_decode($response);

echo json_encode($fixtures, JSON_PRETTY_PRINT);
?>