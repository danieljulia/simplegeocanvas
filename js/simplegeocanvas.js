
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
  this.ispinching=false;
  this.stats_has=true;
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
  if(this.stats_has){ 
    this.stats = new Stats();
    this.stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';

    document.body.appendChild( this.stats.domElement );

  }

}

simplecanvas.prototype.initEvents=function(){

     //events
    var ref=this;

  this.mycanvas.mousedown(function(e) {
    console.log("mousedown",e);
      ref.getPosition(e);
      ref.doDown(ref);
      ref.onDown(ref);
  });

/*
  $(window).live('touchstart', function(e){
      console.log("w touchstart",e);

    });

*/


     $(this.mycanvas).live('touchstart', function(e){
      console.log("touchstart",e);

        if(e.originalEvent.touches.length==2){
            //pinch
            ref.ispinching=true;
            var d=ref.pinchDist(e);
            ref.pinching_inid=d;
            ref.scaleini=ref.scale;
            return;
          
        }

        e.preventDefault();
        e.stopPropagation();
        ref.getPosition(e);
        ref.doDown(ref);
        ref.onDown(ref);
    });

    this.mycanvas.mouseup(function(e) {
      console.log("mouseup",e);
        e.preventDefault();
        ref.getPosition(e);
        ref.doUp(ref);
        ref.onUp(ref);
    });

    
 this.mycanvas.live('touchmove', function(e){
  if(ref.ispinching){
      //zoom in zoom out
      //probably should be on doScale
     var d=ref.pinchDist(e);
     ref.scale=ref.scaleini/(ref.pinching_inid/d);
     return;
  }

    //console.log("touchmove",e);
        ref.getPosition(e);
        ref.doMove(ref);
        ref.onMove(ref);

        e.stopPropagation();
        e.preventDefault();
        return false;
       
      });
  

 this.mycanvas.live('touchcancel', function(e){
  console.log("touchcancel",e);
         ref.getPosition(e);
         ref.doUp(ref);
          ref.onUp(ref);
     
    });

 this.mycanvas.live('touchend', function(e){
    ref.ispinching=false;
    console.log("touchend",e);
    ref.doUp(ref);
    ref.onUp(ref);
   
  });

 //  canvas.addEventListener('touchend',ended, false);

    this.mycanvas.mousemove(function(e) {
     // console.log("mousemove",e);
    // jQuery would normalize the event
     e.preventDefault();
     ref.getPosition(e);

      ref.doMove(ref);
      ref.onMove(ref);

      });

    this.mycanvas.bind('mousewheel', function(e){
        if(e.originalEvent.wheelDelta /120 > 0) {
           ref.doScale(2);
        }
        else{
           ref.doScale(0.5);
        }
    });

     
}


simplecanvas.prototype.pinchDist=function(e){
    var x1 = Math.floor(e.originalEvent.touches[0].pageX/this.zoom);
    var y1 = Math.floor(e.originalEvent.touches[0].pageY/this.zoom);
    var x2 = Math.floor(e.originalEvent.touches[1].pageX/this.zoom);
    var y2 = Math.floor(e.originalEvent.touches[1].pageY/this.zoom);

    var mx=(x1+x2)/2;
    var my=(y1+y2)/2;
    var d=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
    return d;
}




simplecanvas.prototype.respondCanvas=function(){

  this.w=$(this.container).width();
  this.h=$(this.container).height();
  
//$('#content').attr('height', w/rzoom-58); 

  //tamaño en pixels del canvas
  console.log("size changed",this.w,this.h);
  console.log(this);
  $(this.mycanvas).attr('width', this.w/this.zoom); //max width
   $(this.mycanvas).attr('height', this.h/this.zoom ); //max height
  
  this.update();

}

simplecanvas.prototype.update=function(){ 
  this.doUpdate();
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
    mx = Math.floor(e.originalEvent.touches[0].pageX/this.zoom);
    my = Math.floor(e.originalEvent.touches[0].pageY/this.zoom);
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

simplecanvas.prototype.onClick=function(e){

}

simplecanvas.prototype.onUp=function(e){
  
}

simplecanvas.prototype.onMove=function(e){
  
}

simplecanvas.prototype.onPaint=function(e){
  
}

simplecanvas.prototype.doDown=function(e){


}
simplecanvas.prototype.doUp=function(e){


}
simplecanvas.prototype.doMove=function(e){


}
simplecanvas.prototype.doScale=function(scale){

}

/**
geo canvas

*/
function simplegeocanvas(div){
  this.div=div;
  this.center={'lat':0,'lng':0};
  this.zoom=1;

  this.layers=new Array();
  this.scale=50;
  this.markers=new Array();
  this.showguides=false;
  this.sz=2; //size of marker
  this.roll=-1; //current rolled marker
  this.selected=-1; //current selected marker

  this.currentLayer="";
}

simplegeocanvas.prototype = new simplecanvas(this.div );

simplegeocanvas.prototype.geo2pos=function(lat,lng){
  var x=Math.floor((-lat+this.center.lat)*this.scale+(this.h/2));
  var y=Math.floor((lng-this.center.lng)*this.scale+(this.w/2));
  return [x,y];
}

simplegeocanvas.prototype.pos2geo=function(x,y){
  var lat=-x/(this.scale);
  var lng=y/(this.scale);


  return [lat,lng];
}

simplegeocanvas.prototype.addMarker=function(lat,lng,color,txt,layer){
  this.markers.push({'lat':lat,'lng':lng,'color':color,'txt':txt,'layer':layer});
}


simplegeocanvas.prototype.doUpdate=function(){
  var dtrigger=20;
  var dmin=100;
 
  this.roll=-1;

  for(var c=0;c<this.markers.length;c++){
    var p=this.markers[c];
    var dx=Math.abs(p.x-this.mouseX);
    if(dx<dtrigger){
        var dy=Math.abs(p.y-this.mouseY);
        if(dy<dtrigger){
          var d=Math.sqrt(dx*dx+dy*dy);
          if(d<dmin){
            dmin=d;
            this.roll=p;
          }
          
        }

    }
  }

   for(var c=0;c<this.markers.length;c++){
    this.markers[c].visible=false;
    this.markers[c].roll=false;
  }

  if(this.roll!=-1){
    this.roll.roll=true;
   
  }


}

simplegeocanvas.prototype.paint=function(e){

    if(this.stats)
    this.stats.begin();


   this.ctx.fillStyle = "#000000";
  this.ctx.fillRect(0,0,this.w,this.h);

  //if(this.captured){ 
  this.ctx.beginPath();
  this.ctx.strokeStyle="#666";//rgba(128,128,128,0.5)";
  this.ctx.lineWidth = 1;

  if(this.showguides){ 
  for(var lng=-180;lng<180;lng++){
    var p=this.geo2pos( 0,lng );
    if(p[1]>0){
      if(p[1]<this.w){ 

        this.ctx.moveTo( p[1],0 );
        this.ctx.fillStyle = "Red";
        this.ctx.fillText( lng,p[1],12 );
        this.ctx.lineTo( p[1],this.h ); 
        this.ctx.stroke();
      }
    }
  }
  for(var lat=-90;lat<90;lat++){
    var p=this.geo2pos(lat,0);
    if(p[0]>0){
      if(p[0]<this.h){ 
        
        this.ctx.moveTo(0,p[0]);
        this.ctx.fillStyle = "Red";
        this.ctx.fillText(lat,0,p[0]);
        this.ctx.lineTo(this.w,p[0]); 
        this.ctx.stroke();
      } 
    }
  }
}

   //draw markers 
    this.ctx.fillStyle = "rgba(128,128,128,128)";

    //size of marker depends of scale
    this.sz=Math.floor(this.scale/2000); //2000 is ok
    if(this.sz<2) this.sz=2;

   for(var c=0;c<this.markers.length;c++){
    var p=this.markers[c];
    if(this.currentLayer=="" || p.layer==this.currentLayer)
     this.paintMarker(p);
  }

  if(this.selected!=-1) this.paintMarker(this.selected);
  if(this.roll!=-1) this.paintMarker(this.roll);

  if(this.stats) this.stats.end();

}

simplegeocanvas.prototype.paintMarker=function(p){

    var res=this.geo2pos(p.lat,p.lng);
    var x=res[1];
      if(x>0 && x<this.w){ 

      var y=res[0];
        if(y>0 && y<this.h){ 
            
              this.ctx.fillStyle= p.color;

              if(p.roll) this.ctx.fillStyle="#f00";
              if(p==this.selected) this.ctx.fillStyle="#ff0";
              this.ctx.beginPath();
              this.ctx.fillRect(x-this.sz,y-this.sz,this.sz*2,this.sz*2);

             // this.ctx.arc(x,y,sz*2,0,2*Math.PI);
              this.ctx.fill();

              p.x=x;
              p.y=y;
              p.visible=true;
         }

    }
}

simplegeocanvas.prototype.addLayer=function(color,label){
  this.layers.push({color:color,label:label});
}

simplegeocanvas.prototype.selectLayer=function(label){
  this.currentLayer=label;
}
simplegeocanvas.prototype.centerLayer=function(label){
    var lat=0;
    var lng=0;
    var count=0;
    var d=0;
    var countd=0;

    for(var c=0;c<this.markers.length;c++){
      var p=this.markers[c];
      if(p.layer==label){
        lat+=p.lat;
        lng+=p.lng;
        if(c%20){ //sampling distances
          d+=Math.sqrt( (p.lat-lat)*(p.lat-lat)+(p.lng-lng)*(p.lng-lng));
          countd++;

        }
        count++;
      }
    }

lat=lat/count;
    lng=lng/count;

     for(var c=0;c<this.markers.length;c++){
      var p=this.markers[c];
        if(c%20){ //sampling distances
          d+=Math.sqrt( (p.lat-lat)*(p.lat-lat)+(p.lng-lng)*(p.lng-lng));
          countd++;

        }
     }

    
    this.center.lat=lat;
    this.center.lng=lng;
    var averagedist=d/countd;

    var sc=200000/averagedist;
    if(this.scale>sc) this.scale=sc;
    console.log("dades ",lat,lng,d,averagedist,count);

}

simplegeocanvas.prototype.doScale=function(sc){
    this.scale=this.scale*sc;
    if(this.scale>12000) this.scale=12000;

}

simplegeocanvas.prototype.doDown=function(e){
  this.captured=true;
  this.ini={'x':e.mouseX,'y':e.mouseY};
  this.rini=this.ini;
  var p=this.pos2geo(e.mouseX,e.mouseY);

  var size=this.pos2geo(this.w,this.h);

  this.lng=-p[0]+size[0]/2+this.center.lng;
  this.lat=-p[1]+size[1]/2+this.center.lat;
  //this.lng=p[1];

}
simplegeocanvas.prototype.doUp=function(e){
  this.captured=false;
  var d=Math.sqrt( (this.rini.x-e.mouseX)*(this.rini.x-e.mouseX)+
    (this.rini.y-e.mouseY)*(this.rini.y-e.mouseY));
  
  if(d<10){ 
   if(this.roll!=-1){
      this.selected=this.roll;
   }else{
      this.selected=-1;
   }
   this.onClick(this.selected);
  }
}
simplegeocanvas.prototype.doMove=function(e){
  if(this.captured){ 
    var dx=e.mouseX-this.ini.x;
    var dy=e.mouseY-this.ini.y;
    var res=this.pos2geo(dy,dx);

    this.center.lat-=res[0];
    this.center.lng-=res[1];
    this.ini={x:e.mouseX,y:e.mouseY};
}

  

}

function get_random_color() {
   

    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function get_random_color_ex() {
    var c=new Array();
    for(var i=0;i<3;i++){
      c.push(Math.floor(Math.random()*6+2)*32);
    }
    var color="rgba("+c[0]+","+c[1]+","+c[2]+",0.5)";
    return color;

}


//markers

function geomarker(){

}

 



