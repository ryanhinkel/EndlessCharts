// Dependent on Jquery UI

// Recommended Moisture Levels

function inspect(obj){
  s = '';
  for(prop in obj){
    s+=prop+":"+obj[prop]+"\n";
  }
  alert(s)
}

var Thresholds = Class.extend({

  init: function(selector){

    this.threshold_elements = $(selector)
    //this.id = this.threshold_elements.id;
    
    this.controller_range_presets = [[7,13],[8.5,15],[10,18],[12.5,21.5],[15, 25],[18.5,29.5],[22,34],[26.5,39.5],[32,46],[38.5,53.5]]
    this.moisture_range = [7,53.5]
    this.temperature_range = [-10,110]
    this.salinity_range = [19,24]

    this.sensors_init();
    //alert(this.id)
  },

  sensors_init: function(){
    var moisture = this.get_moisture(this.id)
    var temperature = this.get_temperature(this.id)
    var salinity = this.get_salinity(this.id)
    var t = this;

    this.threshold_elements.each(function(index, element){
      var m_t = $(element).find('.moisture_threshold');
      var t_t = $(element).find('.temperature_threshold');
      var s_t = $(element).find('.salinity_threshold');
      new Threshold(m_t, t.moisture_range, moisture, '%', 1, 21);
      new Threshold(t_t, t.temperature_range, temperature, 'F', 1, 52);
      new Threshold(s_t, t.salinity_range, salinity, '%', .01, 21.35);

      var m_c = $(element).find('.controller')
      if(m_c){
        new Controller(m_c, t.moisture_range, 22, '%', t.controller_range_presets);        
      }

    })
  },

  get_moisture: function(id){
    return [10,30];
  },

  get_temperature: function(id){
    return [32,70];
  },

  get_salinity: function(id){
    return [20.31,20.37];
  }

})

/* ------------------------------------------------------ */

var Threshold = Class.extend({

  init: function(selector, range, values, units, step, current_value){
    this.threshold_element = selector;
    this.range = range;
    this.start_values = values;
    this.units = units;
    this.step = step;


    // dom elements
    this.sui = this.threshold_element.find('.slider')
    this.input_below = this.threshold_element.find('input.below');
    this.input_above = this.threshold_element.find('input.above');
    

    this.sui_init(range[0], range[1], values, step);
    this.handles = this.class_handles()
    this.handles_init(0);
    this.set_current_value_marker(current_value);

  },

  sui_init: function(min, max, values, step){
    var t = this;
    this.sui.slider({
      step: step,
      range: true,
      min: min,
      max: max,
      values: values,
      change: function( event, ui ) {
        // see the people i affect
      },
      slide: function( event, ui ) {
        t.set_inputs(ui.values)
        //inspect(ui)
      },
      start: function(event, ui){


      }
    });

    this.init_inputs(this.sui.slider('values'))
    

  },

  class_handles: function(){
    var handles = this.sui.find('.ui-slider-handle')
    var below_handle = handles.slice(0,1).addClass('below')
    var above_handle = handles.slice(1,2).addClass('above')

    return handles;
  },

  handles_init: function(tol){
    

    this.handles.mousedown(function(e){
      var mousex = e.pageX;
      var mousey = e.pageY;
      $(this).mouseup(function(e){
        
        var x = e.pageX-mousex;
        var y = e.pageY-mousey;
        //alert(x*x+':'+y*y)
        if((x*x+y*y<=tol*tol)){
          $(this).toggleClass('on')
        }
        $(this).unbind('mouseup');
        return true;
      })
      return true;
    })

  },

  init_inputs: function(values){
    var unit = this.units;
    this.input_below.val(values[0] + unit)
    this.input_above.val(values[1] + unit)

    /*
    var l = this.sui.find('.ui-slider-handle.below').css('left');
    var r = this.sui.find('.ui-slider-handle.above').css('left');


    this.input_below.css({
      'position':'absolute',
      'top':16+'px',
      'left':+'px'
    });
    this.input_above.css({
      'position':'absolute',
      'top':16+'px',
      'right':0+'px'
    });
*/

  },

  set_inputs: function(values){
    var unit = this.units;
    this.input_below.val(values[0] + unit)
    this.input_above.val(values[1] + unit)

    /*
    var l = this.sui.find('.ui-slider-handle.below').css('left');
    var r = this.sui.find('.ui-slider-handle.above').css('left');
    
    this.input_below.css({'left':l+'%'});
    this.input_above.css({'left':r+'%'});
  */

  },

  set_current_value_marker: function(value){
    var s = this.threshold_element.find('.slider')
    var marker = $('<div class="value_marker">'+value+this.units+'</div>')
    var left_att = this.get_value_marker_position(value);
    marker.css({
      'position':'absolute',
      'top':-25+'px',
      'left':left_att+'%',
      'z-index': 4
    })
    marker.appendTo(s);
  },

  get_value_marker_position: function(value){
    return (value-this.range[0])/(this.range[1]-this.range[0])*100
  }



})

/* ------------------------------------------------------ */

var Controller = Class.extend({

  init: function(selector, range, value, units, range_presets){
    this.controller = $(selector)
    this.range = range
    this.range_presets = range_presets
    this.start_value = value
    this.units = units
    this.range_presets_midpoints = this.find_midpoints(this.range_presets)
    this.key = 0

    // dom elements
    this.sui = this.controller.find('.slider')
    this.input_below = this.controller.find('input.below');
    this.input_above = this.controller.find('input.above');


    this.sui_init(this.range[0], this.range[1], value);
    this.lock_init();
    this.build_key()


  },

  sui_init: function(min, max, value){
    var controller = this;
    this.sui.slider({
      step: 0.1,
      min: min,
      max: max,
      value: value,
      slide: function( event, ui ) {
        controller.set_inputs(ui.value)
      }
    });

    controller.init_inputs(this.sui.slider('value'))

  },

  lock_init: function(){
    var t = this;
    this.handle = this.controller.find('.ui-slider-handle').addClass('locked');
    this.sui.slider( "option", "disabled", true );
    var tol = 0;
    this.handle.mousedown(function(e){
      
      var mousex = e.pageX;
      var mousey = e.pageY;
      $(this).mouseup(function(e){
        var x = e.pageX-mousex;
        var y = e.pageY-mousey;
        if((x*x+y*y<=tol*tol)){
          $(this).toggleClass('locked')
          
          if($(this).hasClass('locked')){
            t.sui.slider( "option", "disabled", true )
          } else {
            t.sui.slider( "option", "disabled", false)
          }
        }
        $(this).unbind('mouseup');
      })
    })

  },

  init_inputs: function(target){
    this.key = this.find_range_preset(target, this.range_presets_midpoints);
    var range_preset = this.range_presets[this.key];
    this.controller.find('.range_key').remove();
    this.build_range_box(range_preset, this.controller.find('.controller_slider'), 0)
    var unit = this.units;
    this.input_below.val(range_preset[0] + unit);
    this.input_above.val(range_preset[1] + unit);

  },

  set_inputs: function(target){
    var key = this.find_range_preset(target, this.range_presets_midpoints);
    var range_preset = this.range_presets[key];
    if(this.key != key){
      this.key = key;
      var box = this.controller.find('.range_key');
      this.animate_range_box(box, range_preset);
    }
    var unit = this.units;
    this.input_below.val(range_preset[0] + unit);
    this.input_above.val(range_preset[1] + unit);
  },

  find_range_preset: function(target, range_midpoints){
    var key = 0;
    var dist = null;
    var s ='';
    $.each(range_midpoints, function(k, val){
      var d = Math.abs(target - val);
      s += target + ':' + val + ' - ' + d + "<br />";
      if(dist === null || dist >= d){
        dist = d;
        key = k;
      }
    })
    //$('#status').html(s);
    return key;
  },

  find_midpoints: function(range_presets){
    var t = this;
    var range_midpoints = [];
    $.each(range_presets, function(key, val){
      range_midpoints.push(t.middle_point(val))
    })
    return range_midpoints;
  },

  middle_point: function(range){
    return range[0] + (range[1]-range[0])/2
  },

  build_key: function(){
    var range_key = $('.range_key_container');
    var t=this;

    $.each(this.range_presets, function(key, val){
      t.build_range_box(val,range_key, key*10);
    })

  }, 

  build_range_box: function(range_preset, appendTo, top){
    var ratio = 100/(this.range[1]-this.range[0]);
    var l = (range_preset[0]-this.range[0])*ratio;
    var h = (range_preset[1]-this.range[0])*ratio;
    var box = $('<div class="box">'+range_preset[0]+' - '+range_preset[1]+'</div>')
    box.css({
      'position':'absolute',
      'top': top+'px',
      'left': l+'%',
      'width': (h-l)+'%'
    })
    box.addClass('range_key');
    box.appendTo(appendTo);

  },

  animate_range_box: function(box, range_preset){
    var ratio = 100/(this.range[1]-this.range[0]);
    var l = (range_preset[0]-this.range[0])*ratio;
    var h = (range_preset[1]-this.range[0])*ratio;
    box.animate({
      'left': l+'%',
      'width': (h-l)+'%'
    }, {'duration':300, 'queue': false})
  }




})