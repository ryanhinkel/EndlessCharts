<?php 

//sensors.json?site_id='+site+'&start=' + x_axis[0] + '&end=' + x_axis[1]
// 5% moisture
// 20 degree night day

// Function for generating temp

function f($x, $base, $flux){

  $daylight = 60;
  $timezone = -300;
  $shift_to_temp = 720; // minutes to shift sin wave to get reasonable day/night temps
  $x += ($daylight + $timezone + $shift_to_temp);
  
  $x = ($x/4); // minutes to degrees (1440 -> 360)

  $radians = $x*pi()/180; // degrees to radians
  $y = sin($radians); // time to value
  $y_scaler = round(($y+1)/2, 3); // value to scaler

  $y = ($y_scaler*$flux)+ $base;

  return $y;
}

// Function for generating moisture

function m($x, $base, $flux){
  
  $daylight = 60;
  $timezone = -300;
  $shift_to_temp = 720; // minutes to shift sin wave to get reasonable day/night temps
  $x += ($daylight + $timezone + $shift_to_temp);
  
  $x = ($x/4); // minutes to degrees (1440 -> 360)

  $radians = $x*pi()/180; // degrees to radians
  $y = sin($radians); // time to value
  $y_scaler = round(($y+1)/2, 3); // value to scaler

  $y = floor(($y_scaler*$flux)+ $base);

  return $y;
}

// Generate data
if(!isset($_GET['sensors'])){$_GET['sensors'] = '1';}
$sensors = @explode(',', $_GET['sensors']);
$start = $_GET['start'];
$end = $_GET['end'];
$zoom = $_GET['size'];
if(!$zoom){
  $zoom = '10';
}


$output = "";
$output .= "{";
if(is_array($sensors)){
  foreach ($sensors as $key => $value) {

    $output .= $value.":{";
    $output .= "\"start\":".$start.",";
    $output .= "\"data\":[";

    $offset_x = 144;
    $offset_y = 0;
    $base = 20+($offset_y*$value);
    $flux = 60;

    for($i=$start; $i<=$end; $i+=$zoom){
      $output .= "[".$i . ",\"" .m(($i-($value*$offset_x)), $base, $flux) . "\",\"" . f(($i-($value*$offset_x)), $base, $flux) . "\",null]";
      if($i + $zoom <= $end){
        $output .= ",";
      }
    }
    $output .= "]}";
    if($key+1 < count($sensors)){
      $output .= ",";
    }
  }
}
$output .= "}";

print $output;

?>