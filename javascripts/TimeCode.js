var Timecode = Class.extend({
  init: function(init_value){
    if(init_value = 'now'){
      this.date = new Date();
      this.value = Math.floor(this.date.valueOf()/60000);
    } else {
      this.value = init_value;
      this.date = new Date(init_value*60000);
    }
  },

  toLocale: function(){
    return this.date.toLocale();
  },

  toTimecode: function(){
    return this.value
  }


})
