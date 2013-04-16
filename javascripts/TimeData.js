// Time Data class for handling the loading and storing of data
// Requests made through this class will prevent multiple calls
// to the server

// Assumptions
// No spacial information should understood here

/* ------------------------------------------------------------------ */
// Time Data
/* ------------------------------------------------------------------ */

var TimeData = Class.extend({

  init: function(loader, datatiles){
    this.cache = [];
    this.cachezoom = [];
    this.loader = loader;
    this.datatiles = datatiles;
    // [t1,t2,t3]
    // t = [c1,c2,c3]
    // c = [{s1:[dp1, dp2, dp3]},{s2:[dp1, dp2, dp3]}]
  },

  // ----------------------------------------------------
  // Public - Request
  // ----------------------------------------------------

  request: function(chart_section, location){
    var range = chart_section.range;
    var zoom = this.loader.zoom;

    coordinate = 1;

    var tile = this.tile_strict(range[0],range[1], zoom);
    if(!tile){return false;}

    
    $('#message').append("<br />"+zoom+" : "+tile+" : "+location+" : "+coordinate);

    if(this.cached(zoom, tile, location)){
      $('#message').append(" : Cached");
      this.dig_up(zoom, tile, location, chart_section);
    } else {
      return this.server_request(zoom, tile, location, chart_section); 
    }
  },

  // ----------------------------------------------------
  // Private - Tiling
  // ----------------------------------------------------

  tile_strict: function(start,end){
    return this.valid_tile(start, end);
  },

  timecode: function(tile){
    var block_size = this.loader.zoom_range();
    var s = tile*block_size;
    var e = s+block_size;
    return [s,e];
  },

  // ----------------------------------------------------
  // Private - Request
  // ----------------------------------------------------

  server_request: function(zoom, tile, location, chart_section){
    var range = this.timecode(tile);
    new TimeDataRequest(zoom, tile, location, chart_section, this);
  },


  valid_tile: function(start, end){
    var block_size = this.loader.zoom_range();
    if(start%block_size == 0 && end-start == block_size){
      return start/block_size; // index
    } else {
      alert('false tile');
      return false;
    }
  },

  server_url: function(location, range, zoom){
    return this.datatiles + '?sensors='+location+'&start=' + range[0] + '&end=' + range[1] + '&size=' + zoom;
  },

  // ----------------------------------------------------
  // Storage and Parsing
  // ----------------------------------------------------

  parse_and_store: function(zoom, tile, data){

    var moisture = [];
    var temperature = [];
    var salinity = [];

    var tiles = this.ready(this.cache, zoom);
    var locations = this.ready(tiles, tile);

    // {134:[x, y1, y2, y3]} -> [x, y1], [x, y2], [x, y3]
    $.each(data, function(location, properties){

      // should only be executed once
      // one location per request

      var data = properties['data'];

      $.each(data, function(key, c){
        
        var time_value = c[0];
        var m_value = c[1];
        var t_value = c[2];
        var s_value = c[3];

        var moisture_coor = [time_value, m_value];
        var temp_coor = [time_value, t_value];
        var salinity_coor = [time_value, s_value];

        moisture.push(moisture_coor)
        temperature.push(temp_coor)
        salinity.push(salinity_coor)

      })
      // don't use 1,2,3 - use moisture, temp, salinity
      locations[location]={};
      locations[location]['moisture'] = {};
      locations[location]['moisture'][location] = moisture;
      locations[location]['temperature'] = {};
      locations[location]['temperature'][location] = temperature;
      locations[location]['salinity'] = {};
      locations[location]['salinity'][location] = salinity;

    })

  },

  dig_up: function(zoom, tile, location, chart_section){
    
    var data = this.cache[zoom][tile][location];
    chart_section.update_location_data(location, data);
  },

  // ----------------------------------------------------
  // Caching 
  // ----------------------------------------------------

  cached: function(zoom, tile, location){

    if(this.cache[zoom]!==undefined){ 
      if(this.cache[zoom][tile]!==undefined){
        if(this.cache[zoom][tile][location]!==undefined){
          return true;
        }
      }
    }
    return false;
  },

  ready: function(arr, index){
    if(!arr[index]){
      arr[index] = [];
    }
    return arr[index];
  },
  

})

var TimeDataRequest = Class.extend({

  init: function(zoom, tile, location, chart_section, data_store){
    var request = this;
    this.chart_section = chart_section;
    this.zoom = zoom;
    this.tile = tile;
    this.location = location;


    var range = chart_section.range;
    var zoom = data_store.loader.zoom;
    var factor = data_store.loader.ZOOM_FACTOR;
    var baseres = data_store.loader.BASE_RES
    var simpleres = baseres*Math.pow(factor,zoom);

    var url = data_store.server_url(location, range, simpleres);
    var options = {
      url: url,
      type: "get",
      dataType: "json",
      error: request.error,
      success: function(data){
        data_store.parse_and_store(request.zoom, request.tile, data);
        data_store.dig_up(request.zoom, request.tile, request.location, request.chart_section);
      }
    }
    $('#message').append(" : Request made to "+url);
    $.ajax(options);
    return true;
  },

  error: function(){
    alert('ErroRoooooo!');
  }



})