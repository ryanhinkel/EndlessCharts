var TimeData = Class.extend({

  init: function(container){
    var testdata = $.parseJSON({87:{"start":22220000,"data":[[22220000,"37.002","45.191",null],[22220010,"37.003","45.684",null],[22220020,"37","46.177",null],[22220030,"36.999","46.699",null]]}});
    var timeblocks = [];
  },

  parse: function(sensor_data, val_index){
    return [sensor_data[0], sensor_data[val_index]];
  }



}