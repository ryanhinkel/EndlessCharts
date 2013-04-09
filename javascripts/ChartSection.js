// ChartSection

var ChartSection = Class.extend({

  init: function(wall, section_width, index, range, zoom){
    this.section_width = section_width;
    this.i = index;
    this.range = range;
    this.zoom = zoom;
    
    this.wall = wall;
    this.section = this.test_section();
    this.section.appendTo(this.wall);
    this.section.width(this.section_width);


  },

  tile: function(){
    var g = this.i*this.section_width;
    this.section.css({'position':'absolute', 'top':'0px', 'left':g+'px'})
    this.section.addClass('x_'+this.i)
  },

  test_section: function(zoom, range){
    return $("<div class='section'>"+this.test_image(this.zoom)+this.range[0]+"<br />"+(this.range[1]-this.range[0])+"</div>")
  },

  flash: function(){
    //this.section.hide().fadeIn();
  },

  remove: function(){
    this.section.remove();
  },

  draw: function(){
    //this.section.hide().fadeIn('slow');
  },

  plot: function(){


  },

  test_image: function(zoom){
    return "<img src='/images/test_line_"+zoom+".png' />";
  }



})

