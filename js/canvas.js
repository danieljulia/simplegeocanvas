var canvas = document.getElementById('mycanvas');
var ctx = canvas.getContext('2d');
//eliminar antialias
ctx.translate(0.5, 0.5);

var c=0;
var mycanvas;
var container;
var w;
var h;
var mouseX=0,mouseY=0;
var mypad;

$(document).ready(function(){
	
  window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
	})();

	//Run function when browser  resize
	$(window).resize( respondCanvas );
	mycanvas=$('#mycanvas');
	container = $(mycanvas);//.parent();
	respondCanvas();



  mypad=new pad();

  
	   //events

    $('#mycanvas').mousedown(function(e) {
         getPosition(e);
        mypad.down();
    });

    $('#mycanvas').live('touchstart', function(e){
        e.preventDefault();
        e.stopPropagation();
        getPosition(e);
        mypad.down();
    });

     $('#mycanvas').mouseup(function(e) {
        e.preventDefault();
        getPosition(e);
        mypad.up();
    });

    
   $('#mycanvas').live('touchmove', function(e){
    
        getPosition(e);
        setInfo("touchmove "+mypad.ini_mx+" "+mypad.ini_my);
        mypad.move();

        e.stopPropagation();
        e.preventDefault();
        return false;
       
      });

 $('#mycanvas').live('touchcancel', function(e){
         getPosition(e);
          mypad.up();
     
    });

 $('#mycanvas').live('touchend', function(e){
            mypad.up();
     
    });

 //  canvas.addEventListener('touchend',ended, false);

      $('#mycanvas').mousemove(function(e) {
      // jQuery would normalize the event
       e.preventDefault();
	     getPosition(e);
       setInfo("mousemove "+mypad.ini_mx+" "+mypad.ini_my);
    
	     mypad.move();

	  })

      update();

});



function setInfo(txt,b){
  if(!debug) return;
  $('#info').html(txt);
  if(b){
    setTimeout("hideInfo()",2000);
  }

}

function hideInfo(){
  $('#info').hide();
}

function respondCanvas(){

	w=$(container).width();
	h=$(container).height();
	
//$('#content').attr('height', w/rzoom-58); 

  //tamaño en pixels del canvas
	mycanvas.attr('width', w/zoom); //max width
	mycanvas.attr('height', h/zoom ); //max height
	
	update();

}



function update(){

  	ctx.fillStyle='#ffffff';
    ctx.beginPath();
  	ctx.fillRect(0,0,w,h);
 
   if(mypad){
     mypad.update();
     mypad.paint();
    }
   requestAnimFrame(function() {
      update();
  });
}


function getPosition(e) {
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
    mx=Math.floor(x/zoom);
    my=Math.floor(y/zoom);

  }
  if(mx!=0 && my!=0){
    mouseX=mx;
    mouseY=my;
  }

};



//pad
function pad(){
  this.points=new Array();
  this.center={'lat':41,'lng':2};
  this.zoom=1;

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


pad.prototype.paint=function(){
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


   //pintar los puntos donde se ha clicado
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


pad.prototype.down=function(dragging){

  var res=this.pos2geo(mouseY,mouseX);

  this.points.push({lat:res[0]+this.center.lat,lng:res[1]+this.center.lng,color:get_random_color()});

  this.captured=true;
  this.init={x:mouseX,y:mouseY};
}

pad.prototype.move=function(){
  if(this.captured){
   
   var dx=mouseX-this.init.x;
   var dy=mouseY-this.init.y;
   var res=this.pos2geo(dy,dx);

   this.center.lat-=res[0];
   this.center.lng-=res[1];
     this.init={x:mouseX,y:mouseY};
 
}


}


pad.prototype.up=function(){
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




