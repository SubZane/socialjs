<?php
if(isset($_GET['url'])) {
  $pincount = json_decode( file_get_contents( 'http://api.pinterest.com/v1/urls/count.json?callback=receiveCount&url='.$_GET['url'] ) );
  echo isset($pincount->count)?intval($pincount->count):0;
} else {
  echo 'not set';
}
?>
