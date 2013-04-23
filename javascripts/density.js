// Pixel Vis - Density

// Assumptions
// Ratio 
// Must Drop Chart_Sections after a point
// Must gather fringe datapoints to chart effectively

/* ------------------------------------------------------------------ */
// Chart System
/* ------------------------------------------------------------------ */

var Density = Class.extend({

  init: function(container, pw, ph, pr){
    this.element = $(container);
    
    this.molecule_width = pw;
    this.molecule_height = ph;
    this.molecule_radius = pr;
    this.density = .5;

    this.canvas = this.init_canvas();
    this.context = this.canvas[0].getContext("2d")

    this.size(this.element.width(), this.element.height());
    //this.render();

  },

  // Public

  set_density: function(d){
    this.density = d;
  },

  render: function(){
    this.fill(0,0);
  },

  refresh: function(x, y){
    this.clear();
    this.fill(x, y);

  },  

  clear : function(){
    this.context.clearRect(0, 0, this.element_width, this.element_height) 
  },

  // Private

  init_canvas: function(){
    var canvas = $("<canvas class='section' width='"+this.element_width+"px' height='"+this.element_height+"px'></canvas>").appendTo(this.element);
    return canvas
  },

  size: function(w, h){
    this.element_width = w;
    this.element_height = h;
    this.canvas.attr('width', w)
    this.canvas.attr('height', h)

  },

  fill: function(mousex,mousey){
    var skipx = this.molecule_width;
    var skipy = this.molecule_height;
    var wide = this.molecules_wide();
    var high = this.molecules_high();
    for(var y=0; y<high; y++){
      for(var x=0; x<wide; x++){
        // color
        var r = Math.floor(155*x/wide+100);
        var b = Math.floor(155*y/high+100);
        var g = Math.floor(255*((x/wide)+(y/high))/2+00);

        var rgb = "#"+'33'+this.decimalToHex(b,2)+this.decimalToHex(g,2);

        this.house(x*skipx+.5, y*skipy+.5, (this.molecule_radius), rgb);
       

        //
        
        //e.appendTo(this.element);
        //alert(r);
      }
    }
  },

  molecules_wide: function(){
    return Math.ceil(this.element_width/this.molecule_width);
  },

  molecules_high: function(){
    return Math.ceil(this.element_height/this.molecule_height);
  },

  // Shapes

  dot: function(x, y, r, color){
    this.context.beginPath();
    this.context.arc(x, y, r, 0, Math.PI*2, true);
    this.context.closePath();
    //
    this.context.fillStyle = color;
    this.context.fill();

  },

  house: function(x, y, base, color){
    
    var a = [x-base/2, y];
    var b = [x+base/2, y];
    var c = [x+base/2, y-(base*.6)];
    var cov = [x+base/1.5, y-(base*.6)];
    var d = [x, y-(base*1.2)];
    var dov = [x-base/1.5, y-(base*.6)];
    var e = [x-base/2, y-(base*.6)];
    var f = [x-base/2, y];
    var gcl = [a,b,c,cov,d,dov,e,f];
    
    l=gcl.length
    
    //
    this.context.beginPath()
    this.context.moveTo(gcl[0][0],gcl[0][1]);
    for(var i=1;i<l;i++){

      this.context.lineTo(gcl[i][0],gcl[i][1]);
    }
    //
    this.context.fillStyle = color;
    this.context.fill();

  },

  // Color!

  decimalToHex: function (d, padding) {
    var hex = Number(d).toString(16);
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
  }


})