
/**
simple geo canvas
author: Daniel Julià
web: kiwoo.org , pimpampum.net
*/


function simplegeocanvas(div){
  this.c=0;
  this.mycanvas;
  this.container;
  this.w;
  this.h;
  this.mouseX=0;
  this.mouseY=0;
  this.mypad;
  this.div=div;
  this.zoom=1;
  this.debug=true;

}


simplegeocanvas.prototype.init=function(){
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
  $(window).resize( this.respondCanvas );
  this.mycanvas=$("#"+this.div);
  this.container = $(this.mycanvas);//.parent();
  this.respondCanvas();
  this.mypad=new pad();
  this.initEvents();
  this.update();

}

simplegeocanvas.prototype.initEvents=function(){


     //events

     var ref=this;
    this.mycanvas.mousedown(function(e) {
         ref.getPosition(e);
        ref.mypad.down(ref.mouseX,ref.mouseY);
    });

    this.mycanvas.live('touchstart', function(e){
        e.preventDefault();
        e.stopPropagation();
        ref.getPosition(e);
        ref.mypad.down(ref.mouseX,ref.mouseY);
    });
    this.mycanvas.mouseup(function(e) {
        e.preventDefault();
        ref.getPosition(e);
        ref.mypad.up(ref.mouseX,ref.mouseY);
    });

    
 this.mycanvas.live('touchmove', function(e){
    
        ref.getPosition(e);
        ref.setInfo("touchmove "+ref.mypad.ini_mx+" "+ref.mypad.ini_my);
        ref.mypad.move(ref.mouseX,ref.mouseY);

        e.stopPropagation();
        e.preventDefault();
        return false;
       
      });

 this.mycanvas.live('touchcancel', function(e){
         ref.getPosition(e);
          ref.mypad.up();
     
    });

 this.mycanvas.live('touchend', function(e){
            ref.mypad.up();
     
    });

 //  canvas.addEventListener('touchend',ended, false);

      this.mycanvas.mousemove(function(e) {
      // jQuery would normalize the event
       e.preventDefault();
       ref.getPosition(e);
       ref.setInfo("mousemove "+ref.mypad.ini_mx+" "+ref.mypad.ini_my);
    
       ref.mypad.move();

    })

     
}

simplegeocanvas.prototype.setInfo=function(txt,b){
  if(!this.debug) return;
  $('#info').html(txt);
  if(b){
    setTimeout("hideInfo()",2000);
  }

}

simplegeocanvas.prototype.hideInfo=function(){
  $('#info').hide();
}

simplegeocanvas.prototype.respondCanvas=function(){

  this.w=$(this.container).width();
  this.h=$(this.container).height();
  
//$('#content').attr('height', w/rzoom-58); 

  //tamaño en pixels del canvas
  console.log(this.mycanvas);
  this.mycanvas.attr('width', this.w/this.zoom); //max width
  this.mycanvas.attr('height', this.h/this.zoom ); //max height
  
  this.update();

}

simplegeocanvas.prototype.update=function(){ 

    this.ctx.fillStyle='#ffffff';
    this.ctx.beginPath();
    this.ctx.fillRect(0,0,this.w,this.h);


  
   if(this.mypad){
     this.mypad.update();
     this.mypad.paint(this.ctx,this.w,this.h);
    }
    var ref=this;
   requestAnimFrame(function() {
      ref.update();
  });
}

simplegeocanvas.prototype.getPosition=function(e){ 

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




//pad
function pad(){
  this.points=new Array();
  this.center={'lat':41,'lng':2};
  this.zoom=1;
  this.captured=false;

}

pad.prototype.geo2pos=function(lat,lng){
  var x=(-lat+this.center.lat)*50;
  var y=(lng-this.center.lng)*50;
  return [x,y];
}

pad.prototype.pos2geo=function(x,y){
  var lat=-x/(50);
  var lng=y/(50);
  return [lat,lng];
}


pad.prototype.paint=function(ctx,w,h){
  //if(this.captured){ 
  ctx.beginPath();
  ctx.strokeStyle="#000000";//rgba(128,128,128,0.5)";
  ctx.lineWidth = 1;

  for(var lng=-180;lng<180;lng++){
    var p=this.geo2pos(0,lng);

    ctx.moveTo(p[1],0);
    ctx.fillStyle = "Red";
    ctx.fillText(lng,p[1],12);
    ctx.lineTo(p[1],h); 
    ctx.stroke();
  }
  for(var lat=-90;lat<90;lat++){

    var p=this.geo2pos(lat,0);
    ctx.moveTo(0,p[0]);
    ctx.fillStyle = "Red";
    ctx.fillText(lat,0,p[0]);
    ctx.lineTo(w,p[0]); 
    ctx.stroke();
  }


   //paint clicked locations
   for(var c=0;c<this.points.length;c++){
    var p=this.points[c];
 
    var res=this.geo2pos(p.lat,p.lng);
    var x=res[1];
    var y=res[0];
 
      ctx.strokeStyle= p.color;

      ctx.beginPath();
      ctx.arc(x,y,20,0,2*Math.PI);
      ctx.stroke();
   }
  

}

pad.prototype.update=function(ctx){


}


pad.prototype.down=function(mouseX,mouseY){

console.log(mouseX,mouseY);
  var res=this.pos2geo(mouseY,mouseX);

  this.points.push({lat:res[0]+this.center.lat,lng:res[1]+this.center.lng,color:get_random_color()});

  this.captured=true;
  this.init={x:mouseX,y:mouseY};
}

pad.prototype.move=function(mouseX,mouseY){
  if(this.captured){
   
   var dx=mouseX-this.init.x;
   var dy=mouseY-this.init.y;
   var res=this.pos2geo(dy,dx);

   this.center.lat-=res[0];
   this.center.lng-=res[1];
     this.init={x:mouseX,y:mouseY};
 
}


}


pad.prototype.up=function(mouseX,mouseY){
 // this.points.push({x:mouseX,y:mouseY,color:get_random_color()});
  this.captured=false;
}


pad.prototype.reset=function(){

}


function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}




