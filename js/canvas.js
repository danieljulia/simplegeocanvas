
/**
simple geo canvas
author: Daniel Julià
web: kiwoo.org , pimpampum.net
*/


function simplecanvas(div){
  this.mycanvas;
  this.container;
  this.div=div;
  this.w;
  this.h;
  this.mouseX=0;
  this.mouseY=0;
  
  this.zoom=1;
  this.debug=true;

}


simplecanvas.prototype.init=function(){
  var canvas = document.getElementById(this.div);
  this.ctx = canvas.getContext('2d');
  //remove antialias
 this.ctx.translate(0.5, 0.5);

  window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();

  //Run function when browser  resizes
  $(window).bind('resize', $.proxy(this.respondCanvas, this));
 // $(window).resize( this.respondCanvas );
  this.mycanvas=$("#"+this.div);
  this.container = $(this.mycanvas);//.parent();
  this.respondCanvas();
  this.initEvents();
  this.update();

  //stats
   this.stats = new Stats();
  this.stats.setMode(0); // 0: fps, 1: ms

  // Align top-left
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.left = '0px';
  this.stats.domElement.style.top = '0px';

  document.body.appendChild( this.stats.domElement );

}

simplecanvas.prototype.initEvents=function(){

     //events
    var ref=this;
    this.mycanvas.mousedown(function(e) {
        ref.getPosition(e);
        ref.doDown(ref);
        ref.onDown(ref);
    });

    this.mycanvas.live('touchstart', function(e){
        e.preventDefault();
        e.stopPropagation();
        ref.getPosition(e);
        ref.doDown(ref);
        ref.onDown(ref);
    });
    this.mycanvas.mouseup(function(e) {
        e.preventDefault();
        ref.getPosition(e);
        ref.doUp(ref);
        ref.onUp(ref);
    });

    
 this.mycanvas.live('touchmove', function(e){
    
        ref.getPosition(e);
        ref.doMove(ref);
         ref.onMove(ref);

        e.stopPropagation();
        e.preventDefault();
        return false;
       
      });

 this.mycanvas.live('touchcancel', function(e){
         ref.getPosition(e);
         ref.doUp(ref);
          ref.onUp(ref);
     
    });

 this.mycanvas.live('touchend', function(e){
  ref.doUp(ref);
           ref.onUp(ref);
     
    });

 //  canvas.addEventListener('touchend',ended, false);

      this.mycanvas.mousemove(function(e) {
      // jQuery would normalize the event
       e.preventDefault();
       ref.getPosition(e);

    ref.doMove(ref);
        ref.onMove(ref);

    })

     
}

/*
simplecanvas.prototype.setInfo=function(txt,b){
  if(!this.debug) return;
  $('#info').html(txt);
  if(b){
    setTimeout("hideInfo()",2000);
  }

}

simplecanvas.prototype.hideInfo=function(){
  $('#info').hide();
}
*/
simplecanvas.prototype.respondCanvas=function(){

  this.w=$(this.container).width();
  this.h=$(this.container).height();
  
//$('#content').attr('height', w/rzoom-58); 

  //tamaño en pixels del canvas
  console.log(this.w,this.h);
  console.log(this);
  $(this.mycanvas).attr('width', this.w/this.zoom); //max width
   $(this.mycanvas).attr('height', this.h/this.zoom ); //max height
  
  this.update();

}

simplecanvas.prototype.update=function(){ 
   this.paint();
    var ref=this;
   requestAnimFrame(function() {
      ref.update();
  });
}

simplecanvas.prototype.paint=function(){ 
  if(this.stats)
    this.stats.begin();

 

  this.ctx.fillStyle='#aaaaaa';
    this.ctx.beginPath();
    this.ctx.fillRect(0,0,this.w,this.h);
    this.onPaint(this);
    if(this.stats) this.stats.end();

}

simplecanvas.prototype.getPosition=function(e){ 

  var mx,my;
  if(e.originalEvent.touches){
    mx = Math.floor(e.originalEvent.touches[0].pageX/zoom);
    my = Math.floor(e.originalEvent.touches[0].pageY/zoom);
  }else{



    var targ;
    if (!e)
        e = window.event;
    if (e.target)
        targ = e.target;
    else if (e.srcElement)
        targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;

    var x = e.pageX - $(targ).offset().left;
    var y = e.pageY - $(targ).offset().top;
    mx=Math.floor(x/this.zoom);
    my=Math.floor(y/this.zoom);

  }
  if(mx!=0 && my!=0){
    this.mouseX=mx;
    this.mouseY=my;
  }

};

simplecanvas.prototype.onDown=function(e){

}

simplecanvas.prototype.onUp=function(e){
  
}

simplecanvas.prototype.onMove=function(e){
  
}

simplecanvas.prototype.onPaint=function(e){
  
}


/**
geo canvas

*/
function simplegeocanvas(div){
  this.div=div;
}

simplegeocanvas.prototype = new simplecanvas(this.div );
simplegeocanvas.prototype.doDown=function(e){
  console.log("do down in geocanvas");

}
simplegeocanvas.prototype.doUp=function(e){
  console.log("do up in geocanvas");

}
simplegeocanvas.prototype.doMove=function(e){
  console.log("do move in geocanvas");

}

function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}




