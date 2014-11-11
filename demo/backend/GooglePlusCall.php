<?php
if(isset($_GET['url'])) {
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, "https://clients6.google.com/rpc");
  curl_setopt($curl, CURLOPT_POST, true);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_POSTFIELDS, '[{"method":"pos.plusones.get","id":"p","params":{"nolog":true,"id":"'.rawurldecode($_GET['url']).'","source":"widget","userId":"@viewer","groupId":"@self"},"jsonrpc":"2.0","key":"p","apiVersion":"v1"}]');
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
  $curl_results = curl_exec ($curl);
  curl_close ($curl);
  $json = json_decode($curl_results, true);
  echo isset($json[0]['result']['metadata']['globalCounts']['count'])?intval( $json[0]['result']['metadata']['globalCounts']['count'] ):0;
} else {
  echo 'not set';
}
?>
