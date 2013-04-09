// ChartDraw

// -------------------------------------------------------------------
// Resolution independent data until drawn

var CCAL = Class.extend({
// Canvas Coordinate Abstracion Layer

  init: function(canvas){

    // Pixel Based
    var canvas;
    var context;

    var dimensions;
    var aspect_ratio;

    // Resolution Independent
    var limits;
    var grid_spacing;
    var data;

    this.dimensions = [];
    this.grid_spacing = [0,0];
    
    this.canvas = canvas;
    this.context = this.canvas[0].getContext("2d")
    this.dimensions[0] = this.canvas.attr("width")
    this.dimensions[1] = this.canvas.attr("height")
  },

  setDimensions : function(d){
    this.canvas.attr("width", d[0])
    this.canvas.attr("height", d[1])
    this.dimensions = d
    this.aspect_ratio = this.dimensions[0]/this.dimensions[1]
  },

  setWidth : function(w){
    this.setDimensions([w,w/this.aspect_ratio])
  },

  // Limits: {x: [10,20], y: [0,100]} in graph scale
  setLimits : function(l){
    this.limits={x:l.x, y:l.y}
  },

  setGrid : function(gc){
    this.grid_spacing = [gc[0],gc[1]];
  },

  grid : function(labels){ 
    
    var startx = Math.floor((this.limits.x[0]+this.timezone)/this.grid_spacing[0])*this.grid_spacing[0]-this.timezone;
    for(i=startx;i<this.limits.x[1];i+=this.grid_spacing[0]){
      this.v_line(i, labels[0])
    }

    var starty = Math.floor(this.limits.y[0]/this.grid_spacing[1])*this.grid_spacing[1]
    for(i=starty;i<this.limits.y[1];i+=this.grid_spacing[1]){
      this.h_line(i, labels[1])
    }
  },

  v_line : function(gx, label){
    var s = [gx,this.limits.y[0]]
    var e = [gx,this.limits.y[1]]
    this.gridline([s,e])
    
    if(label){
      var d = new Date(gx*60000);
      this.text([gx,this.limits.y[0]], d.toLocaleString(), 10, '#888', 'left', 'bottom', [4,-4])
    }toLocaleString
  },

  h_line : function(gy, label){
    var s = [this.limits.x[0],gy]
    var e = [this.limits.x[1],gy]
    this.gridline([s,e])
    if(label){
      this.text([this.limits.x[0],gy], gy, 10, '#888', 'left', 'bottom', [4,0])
    }
  },

  gridline : function(gc){
    this.multiline(gc, '#ccc', .5)
  },

  text : function(gc, text, size, color, align, valign, offset){
    sc = this.to_screen(gc)
    this.context.fillStyle    = color;
    this.context.font         = 'Normal '+size+'px Arial, Sans-Serif';
    this.context.textAlign = align;
    this.context.textBaseline = valign;
    this.context.fillText  (text, sc[0]+offset[0], sc[1]+offset[1]);
  },

  labeler : function(sc, text, size, color){
    this.context.fillStyle    = color;
    this.context.font         = 'Normal '+size+'px Arial, Sans-Serif';
    this.context.textAlign = 'left';
    this.context.textBaseline = 'top';
    this.context.fillText  (text, sc[0], sc[1]);
  },

  point : function(gc,r, color) {
    sc = this.to_screen(gc)
    //
    this.context.beginPath() 
    this.context.arc(sc[0], sc[1], r, 0, Math.PI*2, true) 
    this.context.closePath() 
    //
    this.context.fillStyle = color
    this.context.fill() 
  },

  tick : function(gc, l, w, color) {
    sc = this.to_screen(gc)
    //
    this.context.beginPath() 
    this.context.moveTo(Math.round(sc[0])-(w/2), sc[1]) 
    this.context.lineTo(Math.round(sc[0])-(w/2),sc[1]+l)
    this.context.closePath() 
    //
    this.context.strokeStyle = color
    this.context.lineWidth = w
    this.context.lineCap = 'round'
    this.context.stroke() 
  },

  // [[10,65],[14,80],[20,50],...]
  multiline : function(graph_coordinate_list, color, lw){
    
    l=graph_coordinate_list.length
    var sc=this.to_screen(graph_coordinate_list[0])
    //
    this.context.beginPath()
    this.context.moveTo(sc[0],sc[1]);
    for(var i=1;i<l;i++){
      var sc=this.to_screen(graph_coordinate_list[i])
      this.context.lineTo(sc[0],sc[1])
    }
    //
    this.context.strokeStyle = color
    this.context.lineWidth = lw
    this.context.lineCap = 'round'
    this.context.stroke()
  },

  clear : function(){
    this.context.clearRect(0, 0, this.dimensions[0], this.dimensions[1]) 
  },

  // graph coordinate to screen coordinate translation
  to_screen : function(graph_coordinate){
      // {x: [10,20], y: [0,100]}
      // returns screen coordinates (sc)
      // reverses y axis
      return [
        this.dimensions[0]*((graph_coordinate[0]) - this.limits.x[0]) / (this.limits.x[1]-this.limits.x[0]),
        this.dimensions[1]*(1-(graph_coordinate[1] - this.limits.y[0]) / (this.limits.y[1]-this.limits.y[0]))
      ]
  }
})

// ---------------------------------------------------------------


var Axis = CCAL.extend({
  init: function(canvas){
    this._super(canvas);
    this.timezone = -300;
  },

  draw: function(){
    this.clear();
    this.render()
  },

  //{'label':[[20,30],[40,65]]}
  render : function(){
      var chart = this;

      this.grid([true,true])
  }

})

var SensorDataParser = Class.extend({
  init: function(startfunc, selected){
    var timezone = -5 * 60;
    var data;
    this.m = {};
    this.t = {};
    this.s = {};

    this.startfunc = startfunc;
    this.sel = selected;
  },

  // Data: {'sensor1':[[10,65],[14,80],[20,50]]}
  
  loadData: function(url){
  var chart = this;
  $.ajax(
      {
        url: url,
        type: "get",
        dataType: "json",
        error: function(){alert("Error loading data")},
        success: function(data){
          chart.parseData(data); // json object
          chart.startfunc();

        }
      }             
    );
  },

  isSelected: function(device_id){
    if(this.sel == 'all'){
      return true;
    }
    for(var i = 0; i < this.sel.length; i++) {
      if(this.sel[i] == device_id) {
        return true;
      } 
    }
    return false;

  },

  parseData: function(dataset){ // json object
    alert('parse started');
    var test = []
    var parser = this;
    
    // references to the three datasets for different charts
    var m = this.m;
    var t = this.t;
    var s = this.s;

    var reportstring = '';
    var count = 0;
    var totaldatapoints = 0;
    // variables to store the parsed coordinates list
    var m_c = [];
    var t_c = [];
    var s_c = [];
    $.each(dataset, function(device_id,properties){
      var data = properties['data'];
      
      // reporting --------------------------------------------
      count++
      reportstring+="#"+count+" : "+device_id+" : "+data.length + "\n";
      totaldatapoints += Number(data.length);
      // end reporting ----------------------------------------

      if(parser.isSelected(device_id)){
        $.each(data, function(key, c){
          
          var c_value = c[0];
          var m_value = c[1];
          var t_value = c[2];
          var s_value = c[3];

          var moisture_coor = [c_value, m_value];
          var temp_coor = [c_value, t_value];
          var salinity_coor = [c_value, s_value];

          m_c.push(moisture_coor)
          t_c.push(temp_coor)
          s_c.push(salinity_coor)

          //alert(moisture_coor[0] +"-"+temp_coor[1]+"-"+salinity_coor[1])
        })

        //var location_name = properties['location_name'];

        m[device_id] = m_c;
        t[device_id] = t_c;
        s[device_id] = s_c;


        m_c = [];
        t_c = [];
        s_c = [];
      }


    });


    // reporting
    reportstring+= "Datapoints and Average : "+totaldatapoints+" : "+ totaldatapoints/count;
    alert(reportstring);

    /*
    $.each('this.t', function(nwa, dataset){
          test.push(dataset);

    })
*/


  }

})

var Plotter = CCAL.extend({
  init: function(canvas){
    this._super(canvas);
    this.timezone = -300;
  },

  // Data: {'sensor1':[[10,65],[14,80],[20,50]]}
  setData: function(d){
    this.data=d;
  },

  loadData: function(url){  // Must already be in correct format.
  var chart = this;
  $.ajax(
      {
        url: url,
        type: "get",
        dataType: "json",
        error: function(){alert("Error loading data")},
        success: function(data){
          chart.setData(data)
          chart.draw()
        }
      }             
    );
  },


  draw: function(){
    this.clear();
    this.render()
  },

  render : function(){
      var chart = this;
      var colors_wide = ['#f60b00','#f61f00','#f6320b','#f74301','#f85600','#f86900','#fa7b00','#fc8c00','#fca100','#fcb500','#fcc600','#fcda00','#fdec00','#feff01','#e2ff1b','#c2fd3f','#a2fe5f','#82fd81','#62faa4','#41fac3','#21fae6','#0af0ff','#08cdff','#07abff','#007fff','#3333ff','#0000ff','#111190','#660099']
      var colors = ['#f60b00','#f74301','#fa7b00','#fcb500','#fdec00','#c2fd3f','#62faa4','#0af0ff','#007fff','#111190','#660099']
      var label_spot = 1;
      var color_choice = 0;
      
      this.grid([false, false])

      if(!chart.data){return false;}
      $.each(chart.data, function(label,dataset){
        if(color_choice+1 < colors.length)
          color_choice++
        else
          color_choice = 0;
        var color = colors[color_choice];
        chart.plot(dataset, color)
        chart.labeler([label_spot,1], label, 12, color)
        label_spot+=20;
      })
  },

  plot: function(dataset,color){
    var chart = this;
    lineRes = dataset //this.downsample(dataset, 0)
    pointRes = dataset //this.downsample(dataset, 5)
    labelRes = dataset //this.downsample(dataset, 50)

    this.multiline(lineRes, color, 1)

    $.each(pointRes, function(i,gc){
      //chart.tick(gc, 5, 1, color)
      chart.point(gc, .5, '#000000')
    })

    $.each(labelRes, function(i,gc){
      //chart.text(gc, gc[0], 9, color, 'center', 'top', [0,-15])
    })
  },

  downsample: function(d, pixel_spacing){
    var chart = this;
    sampled = []
    last = null
    $.each(d, function(i,gc){
      sc = chart.to_screen(gc)
      if(last===null || sc[0] - pixel_spacing >= last){
        last = sc[0];
        sampled.push(gc)
      } else {
        // nothing
      }
    })
    return sampled;
  },

  // 2013 01 01 00 54
  to_minutes: function(timecode){
    var timecode = timecode.toString()
    var year = timecode.substr(0, 4);
    var month = timecode.substr(4, 2);
    var day = timecode.substr(6, 2);
    var hour = timecode.substr(8, 2);
    var minute = timecode.substr(10, 2);

    d = new Date(year, (month-1), day , hour, minute)
    return (d.valueOf()/60000);
  }

})
