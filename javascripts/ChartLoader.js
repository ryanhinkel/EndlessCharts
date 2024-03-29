// Resolution Dynamic Charts

// Assumptions
// Ratio 
// Must Drop Chart_Sections after a point
// Must gather fringe datapoints to chart effectively

/* ------------------------------------------------------------------ */
// Chart System
/* ------------------------------------------------------------------ */

var ChartLoader = Class.extend({

  init: function(container){


    // constants
    this.BUFFER_SIZE = -200;
    this.ZOOM_FACTOR = 3;
    this.ZOOM_BASE_RANGE = 1440;
    this.BASE_RES = 2;
    this.SECTION_SIZE = 1000;
    // 20995200 Jan 1 2009
    // 20995200
    this.ORIGIN = 18895680;
    if(this.ORIGIN%(1440*6561)!=0){alert("origin does not fall on an even interval");}
    
    // variables
    this.zoom = 0;
    this.now_padding = 0;
    this.sen

    // The Data
    this.data_store = new TimeData(this, '/testdata/');

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
    this.locations = [];

    // Questionable!
    //this.zoom_res_map = {"1":1, "3":2, "9":6, "27":18, "81":54, "c":162}
    var now = new Timecode('now').toTimecode();
    this.init_chart_space(now,'right');

    this.fill_chart_space();
    this.init_chart_filling();

    // this.draw();
    
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
    var s = index*this.zoom_range()+this.ORIGIN;
    var e = (index+1)*this.zoom_range()+this.ORIGIN;
    return [s,e];
  }, 


  /* ------------------------------------------------------------------ */
  // Section Management
  /* ------------------------------------------------------------------ */

  add_section: function(section_index){
    var range = this.section_range(section_index);
    var section = new ChartSection(this, section_index, range)
    if(this.sections[section_index]){this.remove_section(section_index);}
    this.sections[section_index] = section;
    section.set_locations(this.locations);
    section.draw();
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

  set_locations: function(locations){
    this.locations = locations;
    $.each(this.sections, function(key, val){
      this.set_locations(locations);
    })
  },

  /* ------------------------------------------------------------------ */

  draw: function(){
    $.each(this.sections, function(position, section){
      section.draw();
    })
  },

  /* ------------------------------------------------------------------ */
  // Ratios
  /* ------------------------------------------------------------------ */

  minutes_to_pixels_ratio: function(){
    return this.SECTION_SIZE/this.zoom_range();
  },

  zoom_range: function(){
    return this.ZOOM_BASE_RANGE*Math.pow(this.ZOOM_FACTOR, this.zoom);
  }


})
