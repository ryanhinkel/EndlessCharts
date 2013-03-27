// Resolution Dynamic Charts


// Assumptions
// Better to lockdown canvas width size

/* ------------------------------------------------------------------ */
// System
/* ------------------------------------------------------------------ */

var Chart = Class.extend({

  init: function(container){

    // HTML elements
    this.container = $(container);
    this.wall = $('<div class="wall"></div>');
    this.wall.appendTo(this.container);

    this.section_width = 98;
    this.origin = 0;

    // States 
    // Zoom in all the way is limited by data resolution
    this.zoom = 0;
    this.chunk_size = 12*60;


    // Object for sections reference
    this.sections = {};

    // Init container
    this.container.css({'overflow':'auto'});
    

    // Interaction
    this.wall.draggable({ axis: "x" });

    this.add_section(-3);
    this.add_section(-2);
    this.add_section(-1);
    this.add_section(0);
    this.add_section(1);
    this.add_section(2);
    this.add_section(3);
    this.add_section(4);
    this.add_section(5);
    this.add_section(6);
    this.add_section(7);
    this.add_section(8);

    this.draw();

  },

  /* ------------------------------------------------------------------ */
  // Zoom
  /* ------------------------------------------------------------------ */



  /* ------------------------------------------------------------------ */
  // Range finding
  /* ------------------------------------------------------------------ */

  section_start: function(section_id){
    return this.section_width * section_id;
  },

  section_end: function(section_id){
    return (this.section_width * section_id)+this.section_width-1;
  },

  /* ------------------------------------------------------------------ */

  section_intersect_range: function(section_id, range){
    return (in_range(section_start(section_id), range) || in_range(section_end(section_id), range))
  },

  section_union_range: function(section_id, range){
    return (in_range(section_start(section_id), range) || in_range(section_end(section_id), range))
  },

  in_range: function(n, range){
    return (n<range[1] && n > range[0]);
  },

  /* ------------------------------------------------------------------ */

  range: function(range){
    center = (range[0]+range[1])/2
  },

  slide_range: function(){

  },

  /* ------------------------------------------------------------------ */

  add_section: function(section_id){
    var section = new ChartSection(this.wall, this.section_width)
    if(this.sections[section_id]){
      this.remove_section(section_id);
    }
    section.tile(section_id);
    this.sections[section_id] = section;

  },
  
  /* ------------------------------------------------------------------ */

  remove_section: function(section_id){
    this.sections[section_id].remove();
  },

  /* ------------------------------------------------------------------ */

  draw: function(){
    $.each(this.sections, function(position, section){
      section.draw()
    })
  }

})

/* ------------------------------------------------------------------ */
// Section
/* ------------------------------------------------------------------ */

var ChartSection = Class.extend({

  init: function(wall, section_width){
    this.section_width = section_width;

    this.wall = wall;
    this.section = $("<div class='section'><img src='test.png' /></div>")
    this.section.appendTo(this.wall);
    this.section.width(this.section_width);
  },

  tile: function(x){
    var g = x*this.section_width;
    this.section.css({'position':'absolute', 'top':'0px', 'left':g+'px'})
    this.section.addClass('x_'+x)
  },

  remove: function(){
    this.section.remove();


  },

  draw: function(){
    this.section.hide().fadeIn();


  },

  plot: function(){


  },



})


/* ------------------------------------------------------------------ */
// Data
/* ------------------------------------------------------------------ */

var ChartData = Class.extend({
  init: function(){
    this.data = [];
    
  }

})

