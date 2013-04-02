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

function m(&$moisture, $start_moisture, &$trend){
  
  if(mt_rand(0,10)<2){
    //$moisture += mt_rand(-1, 1);
  }

  if(mt_rand(0,100)<2){
    //$trend * 2;
  }

  $span = 0.01;
  $tolerance = 10;

  $dif = $start_moisture-$moisture;
  $bend = $span*$dif/$tolerance;
  /*
  if(abs($dif/$tolerance)>1){
    $trend / $bend;
  }
  */
   
  if(abs($trend) > .02){
    $trend * .1;
  }

  $trend += ((rand()/getrandmax()-.5) * $span)+$bend;
  
  $moisture += $trend;
  
  /*
  if($trend >= 0)
    print ' ';
  print number_format($trend, 4, '.','') . ' ' . $start_moisture.':'. number_format($moisture, 4, '.','') .  ' ';
  if($bend >= 0)
    print ' ';
  print round($bend,5)."\n";
  */

  return round($moisture,3);
}

// Generate data

$sensors = @explode(',', $_GET['sensors']);
$start = $_GET['start'];
$end = $_GET['end'];

$output = "";
$output .= "{";
if(is_array($sensors)){
  foreach ($sensors as $key => $value) {
    $output .= $value.":{";
    $output .= "\"start\":".$start.",";
    $output .= "\"data\":[";

    $base = mt_rand(40, 50);
    $flux = mt_rand(20, 30);
    $start_moisture = mt_rand(25, 60);
    $moisture = $start_moisture;
    $trend = 0;


    for($i=$start; $i<=$end; $i+=10){



      $output .= "[".$i . ",\"" .m($moisture, $start_moisture, $trend) . "\",\"" . f($i, $base, $flux) . "\",null]";
      if($i + 10 <= $end){
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