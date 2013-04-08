// Time Data class for handling the loading and storing of data
// Requests made through this class will prevent multiple calls
// to the server

// Assumptions
// No spacial information should understood here

/* ------------------------------------------------------------------ */
// Time Data
/* ------------------------------------------------------------------ */

var TimeData = Class.extend({

  init: function(block_size, data_url){
    this.cachetiles = [];
    this.cacheres = [];
    this.data_url = data_url;
    this.block_size = block_size;
    //this.tile_request(this.now_tile())
  },

  // ----------------------------------------------------
  // Public - Request
  // ----------------------------------------------------

  request: function(s, e, r){
    var tile = this.tile_strict(s,e);
    if(!tile){
      return false;
    }
    if(this.cached(tile, r)){
      alert ('cached');
      // this.digup(tile,r)
    } else {
      this.tile_request(tile, r); 
    }
  },

  // ----------------------------------------------------
  // Public - Utility Functions Tile Ranges - might have to be moved to another class
  // ----------------------------------------------------

  tile_now: function(){
    var d = new Date();
    return this.tile(Math.floor(d.valueOf()/60000));
  },

  tile_strict: function(start,end){
    return this.valid_tile(start, end);
  },

  tiles: function(start, end){
    var s_tile = Math.floor(start/this.block_size);
    var e_tile = Math.floor(end/this.block_size);
    return [s_tile, e_tile];
  },

  tile: function(timecode){
    return Math.floor(timecode/this.block_size);
  },

  timecode: function(tile){
    var s = tile*this.block_size;
    var e = s+this.block_size;
    return [s,e];
  },

  // ----------------------------------------------------
  // Private - Request
  // ----------------------------------------------------

  tile_request: function(tile, res){
    var r = this.timecode(tile);
    this.timecode_request(r[0], r[1], res);
  },

  timecode_request: function(start, end, res){
    var td = this;
    if(!this.valid_tile(start, end)){return false;}
    var options = {
      url: td.server_url(start, end, res),
      type: "get",
      dataType: "json",
      error: td.error,
      success: td.store
    }
    $.ajax(options);
    return true;
  },

  valid_tile: function(start, end){
    if(start%this.block_size == 0 && end-start == this.block_size){
      return start/this.block_size;
    } else {
      alert('false tile');
      return false;
    }
  },

  server_url: function(start, end, res){
    return this.data_url + '?start=' + start + '&end=' + end + '&res=' + res;
  },

  error: function(){
    alert("Error loading data");
  },

  // ----------------------------------------------------
  // Parsing
  // ----------------------------------------------------

  store: function(data){
    //alert('store function');
  },

  parse: function(sensor_data, val_index){
    return [sensor_data[0], sensor_data[val_index]];
  },

  // ----------------------------------------------------
  // Caching 
  // ----------------------------------------------------

  cached: function(tile, res){
    // Implement res check here
    //alert this.cacheres[tile];

    return(this.cachetiles[tile]!==undefined);

  }
  

})