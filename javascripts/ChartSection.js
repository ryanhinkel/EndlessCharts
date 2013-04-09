// ChartSection

var ChartSection = Class.extend({

  init: function(wall, data_class, section_width, index, range, zoom){
    
    // data scope
    this.range = range;
    this.zoom = zoom;
    this.y_axis = [0,100];
    this.data_class;
    
    // dom scope
    this.i = index;
    this.element_width = section_width;
    this.element_height = 200;
    
    // The Wall
    this.wall = wall;

    // The Element
    //this.element = this.init_test_image();
    this.element = this.init_canvas();
    this.element.appendTo(this.wall);

    // The plotter
    this.plotter = this.init_plotter();
    this.plotter.setLimits({x: this.range, y: this.y_axis})
    this.size_element_and_plotter_dimensions();
  },

  tile: function(){
    var g = this.i*this.element_width;
    this.element.css({'position':'absolute', 'top':'0px', 'left':g+'px'})
    this.element.addClass('x_'+this.i)
  },

  init_test_image: function(){
    return $("<div class='section'><img src='/images/test_line_"+this.zoom+".png' />"+this.range[0]+"<br />"+(this.range[1]-this.range[0])+"</div>")
  },

  init_canvas: function(){
    return $("<canvas class='section' width='"+this.element_width+"px'></canvas>")
  },

  init_plotter: function(){
    return new Plotter(this.element);
  },

  size_element_and_plotter_dimensions: function(){
    this.element.width(this.element_width);
    this.element.height(this.element_height);
    this.plotter.setDimensions([this.element_width,this.element_height])
  },

  flash: function(){
    this.element.hide().fadeIn();
  },

  draw: function(){
    
    this.plotter.setGrid([720,10])
    //this.plotter.setData(data.t);
    this.plotter.draw()



  },

  remove: function(){
    this.element.remove();
  }



})

