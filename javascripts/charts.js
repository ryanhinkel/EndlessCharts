// Resolution Dynamic Charts

// Assumptions
// Ratio 
// 

/* ------------------------------------------------------------------ */
// Chart System
/* ------------------------------------------------------------------ */

var Chart = Class.extend({

  init: function(container){

    // constants
    this.BUFFER_SIZE = 1000;
    this.ZOOM_FACTOR = 3;
    this.ZOOM_BASE_RANGE = 100;
    this.SECTION_SIZE = 100;
    this.ORIGIN = 0;
    if(this.ORIGIN%1440!=0){alert("origin does not fall on an even interval");}
    
    // variables
    this.zoom = 0;
    this.now_padding = 0;

    // The Container
    this.container = $(container);
    this.container.css({'overflow':'auto'});

    // The Wall
    this.wall = $('<div class="wall"></div>');
    this.container.css({'position':'relative'});
    this.wall.appendTo(this.container);
    //this.wall.draggable({ axis: "x" });

    // Sections
    this.sections = {};

    // Questionable!
    //this.zoom_res_map = {"1":1, "3":2, "9":6, "27":18, "81":54, "c":162}
    var now = new Timecode('now').toTimecode();
    this.init_chart_space(this.ORIGIN+1440,'right');

    this.fill_chart_space();
    this.init_chart_filling();

    // this.draw();
    var data = new TimeData(720, '/testdata/');
    var range = (data.timecode(data.tile_now()));
    data.request(range[0], range[1], 1)

  },

  zoom_to: function(z){
    var center = this.chart_center_minute();
    this.zoom = z;
    this.clear_sections();
    this.init_chart_space(center, 'center');
    this.fill_chart_space();
    //this.put_line(center);
  },

  /* ------------------------------------------------------------------ */
  // Chart Space Management
  //
  // Chart space is the width of the container. These functions 
  // all deal with the visible range of the chart. They were built to
  // set the width of the wall, and scroll the container into position
  /* ------------------------------------------------------------------ */

  init_chart_space: function(t, align){
    var now = new Timecode('now').toTimecode();
    this.set_chart_space_width(now+this.now_padding);
    this.set_chart_space(t, align);
  },

  zoom_chart_space: function(){
    var center = (range[0]+range[1])/2;
  },

  set_chart_space_width: function(t){
    var pixels_from_origin = Math.floor(this.minutes_from_origin(t)*this.minutes_to_pixels_ratio());
    this.wall.width(pixels_from_origin);
  },

  set_chart_space: function(t, align){
    var pixels = this.pixels_from_origin(t, this.zoom);
    var width = this.container.width();
    if(align == 'left'){
      this.move_chart(pixels);
    } else if(align == 'center'){
      this.move_chart(pixels - Math.floor(width/2))
    } else if(align == 'right'){
      this.move_chart(pixels - width);
    }
  },

  minute_range: function(t, align){
    var mfo = this.minutes_from_origin(t);
    var wide = this.minutes_wide();
    if(align=='left'){
      return [mfo, mfo+wide];
    } else if(align=='center'){
      return [mfo-Math.floor(wide/2), mfo+Math.ceil(wide/2)];
    } else if(align=='right'){
      return [mfo-wide, mfo];
    }
  },

  minutes_wide: function(){
    return this.container.width()/this.minutes_to_pixels_ratio();
  },

  minutes_from_origin: function(t){
    return t-this.ORIGIN;
  },

  pixels_from_origin: function(t){
    return Math.floor(this.minutes_from_origin(t)*this.minutes_to_pixels_ratio());
  },

  chart_center_minute: function(){
    return this.ORIGIN + (this.container.scrollLeft() + this.container.width()/2)/this.minutes_to_pixels_ratio()
  },

  move_chart: function(px){
    this.container.scrollLeft(px);
  },

  slide_chart: function(px){
    this.container.animate({scrollLeft: px}, 800);
  },

  /* ------------------------------------------------------------------ */
  // Filling Chart Space
  /* ------------------------------------------------------------------ */

  init_chart_filling: function(){
    t = this;
    this.container.scroll(function(){
      t.fill_chart_space();
    });
  },

  fill_chart_space: function(){
    
    var left = this.container.scrollLeft();
    var s = this.container.scrollLeft()-this.BUFFER_SIZE;
    var e = left+this.container.width()+this.BUFFER_SIZE;

    var tile_range = this.tiles_cover_range(s,e);
    var i = tile_range[0];
    while(i<tile_range[1]){
      if(!this.section_added(i)){
        this.add_section(i);
      } 
      i++;
    }
  },

  refresh_chart_space: function(){

  },

  tiles_cover_range: function(s, e){
    var s_i = Math.floor(s/this.SECTION_SIZE);
    var e_i = Math.ceil(e/this.SECTION_SIZE);
    return [s_i, e_i];
  },

  tiles_contained_in_range: function(s, e){
    var s_i = Math.ceil(s/this.SECTION_SIZE);
    var e_i = Math.floor(e/this.SECTION_SIZE);
    return [s_i, e_i];
  },

  section_range: function(index){
    var s = (index*this.SECTION_SIZE)/this.minutes_to_pixels_ratio()+this.ORIGIN;
    var e = (index+1)*this.SECTION_SIZE/this.minutes_to_pixels_ratio()+this.ORIGIN;
    return [s,e];
  }, 

  /* ------------------------------------------------------------------ */
  // Section Management
  /* ------------------------------------------------------------------ */

  add_section: function(section_index){
    var range = this.section_range(section_index);
    var section = new ChartSection(this.wall, this.SECTION_SIZE, section_index, range)
    if(this.sections[section_index]){
      this.remove_section(section_index);
    }
    section.tile();
    section.flash();
    this.sections[section_index] = section;

  },
  
  remove_section: function(section_index){
    this.sections[section_index].remove();
    delete this.sections[section_index];
  },

  clear_sections: function(){
    var t = this;
    $.each(this.sections, function(key, val){
      t.remove_section(key);
    })
  },

  section_added: function(section_index){
    return (this.sections[section_index]!==undefined);
  },

  /* ------------------------------------------------------------------ */

  draw: function(){
    $.each(this.sections, function(position, section){
      section.draw();
    })
  },

  put_line: function(t){
    var line = $('<div class="put_line" style="width:1px;padding-top:200px;height:100px;background-color:#ccc;position:absolute;">'+
      t+'</div>');
    line.appendTo(this.wall);

    var posx = (t-this.ORIGIN)*this.minutes_to_pixels_ratio();
    line.css({'left':posx+'px'})
  },

  /* ------------------------------------------------------------------ */
  // Ratios
  /* ------------------------------------------------------------------ */

  minutes_to_pixels_ratio: function(){
    return this.SECTION_SIZE/(this.ZOOM_BASE_RANGE*Math.pow(this.ZOOM_FACTOR, this.zoom));
  }

})

/* ------------------------------------------------------------------ */
// Section
/* ------------------------------------------------------------------ */

var ChartSection = Class.extend({

  init: function(wall, section_width, index, range){
    this.section_width = section_width;
    this.i = index;
    this.range = range;
    this.wall = wall;
    this.section = $("<div class='section'>"+range[0]+"<br />"+(range[1]-range[0])+"</div>")
    this.section.appendTo(this.wall);
    this.section.width(this.section_width);
  },

  tile: function(){
    var g = this.i*this.section_width;
    this.section.css({'position':'absolute', 'top':'0px', 'left':g+'px'})
    this.section.addClass('x_'+this.i)
  },

  flash: function(){
    this.section.hide().fadeIn();
  },

  remove: function(){
    this.section.remove();
  },

  draw: function(){
    this.section.hide().fadeIn('slow');
  },

  plot: function(){


  },



})


/* ------------------------------------------------------------------ */
// Timecode
/* ------------------------------------------------------------------ */

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

