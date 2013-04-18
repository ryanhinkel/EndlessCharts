// ChartSection

var ChartSection = Class.extend({

  init: function(loader, index, range){

    // The Loader
    this.loader = loader;

    // The Section
    this.range = range;
    this.y_axis = [0,101];
    
    // The Element
    //this.element = this.init_test_image();
    this.i = index;
    this.element_width = this.loader.SECTION_SIZE;
    this.element_height = 200;

    this.element = this.init_canvas();
    this.size_element();
    this.tile();

    // The Plotter
    this.plotter = this.init_plotter();
    this.plotter.setLimits({x: this.range, y: this.y_axis})
    this.plotter.setGrid([720,10]);
    this.plotter.setDimensions([this.element_width,this.element_height])

    // The Data
    this.active_locations = [];
    this.section_data = {};

  },

  /* ---------------------------------------------------------- */
  // Position and DOM
  /* ---------------------------------------------------------- */

  tile: function(){
    var g = this.i*this.element_width;
    this.element.css({'position':'absolute', 'top':'0px', 'left':g+'px'})
    this.element.addClass('x_'+this.i)
  },

  init_test_image: function(){
    var test_image = $("<div class='section'><img src='/images/test_line_"+this.loader.zoom+".png' />"+this.range[0]+"<br />"+(this.range[1]-this.range[0])+"</div>").appendTo(this.loader.wall);
    return test_image;
  },

  init_canvas: function(){
    var canvas = $("<canvas class='section' width='"+this.element_width+"px'></canvas>").appendTo(this.loader.wall);
    return canvas
  },

  size_element: function(){
    this.element.width(this.element_width);
    this.element.height(this.element_height);
    
  },
  
  /* ---------------------------------------------------------- */
  // Data 
  /* ---------------------------------------------------------- */

  load_location_data: function(location){
    this.loader.data_store.request(this, location);
  },

  set_locations: function(locations){
    this.active_locations = locations;
    this.draw();
  },

  update_location_data: function(location, data){

    // location = 1; location_id
    // data = []; array
    // data[1] = {1:[]} moisture
    // data[2] = {1:[]} temperature

    // section_data = {}

    var section = this;

    if($.inArray(location, section.active_locations)>=0){
      $.each(data, function(key, coordinate){
        if(!section.section_data[key]){
          section.section_data[key] = {}
        }
        section.section_data[key][location] = data[key][location];
        //alert(data[key][location])
      })
    }

    /*
    $.each(data, function(location, d){
      if($.inArray(location, section.active_locations)>=0){
        section.section_data[location]=d;
      }

    })
    */
    this.refresh();


  },
  
  /* ---------------------------------------------------------- */
  // Plotting
  /* ---------------------------------------------------------- */

  init_plotter: function(){
    return new Plotter(this.element);
  },

  flash: function(){
    //this.element.hide().fadeIn('slow');
  },

  draw: function(){
    section = this;
    this.plotter.draw();
    this.section_data = {};
    // must load multiple locations, all refreshing the section when they load.
    // must provide mechanism for not showing chart data if its no longer vis 
    $.each(this.active_locations, function(key, location){
      section.load_location_data(location);
    })
    
  },

  refresh: function(){
    
    this.plotter.setData(this.section_data['temperature']);
    this.plotter.draw();
  },

  
  remove: function(){
    this.element.remove();
  }



})

