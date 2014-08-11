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
  this.c=0;
  this.max_scale=50000;

    //public properties
  this.clearing=true;
  this.background="#aaa";
 // this.fullscreen=false;
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
    if( ref.ispinching) return;

   
      ref.getPosition(e);
      ref.doDown(ref);
      ref.onDown(ref);
  });

/*
  $(window).live('touchstart', function(e){
      console.log("w touchstart",e);

    });

*/

      $(this.mycanvas).on('mouseout', function(e){
        ref.doUp(ref);

        ref.mouseX=-1000;
        ref.mouseY=-1000;
       
      });


     $(this.mycanvas).on('touchstart', function(e){
     

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
       if( ref.ispinching) return;
  
        e.preventDefault();
        ref.getPosition(e);
        ref.doUp(ref);
        ref.onUp(ref);
    });

    
 this.mycanvas.on('touchmove', function(e){
  if(ref.ispinching){
      //zoom in zoom out
      //probably should be on doScale
     var d=ref.pinchDist(e);
     ref.dscale=ref.scaleini/(ref.pinching_inid/d);
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
  

 this.mycanvas.on('touchcancel', function(e){
  console.log("touchcancel",e);
         ref.getPosition(e);
         ref.doUp(ref);
          ref.onUp(ref);
     
    });

 this.mycanvas.on('touchend', function(e){
    setTimeout("ref.stopPinch()",500);
      console.log("saying to stop pinching");
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

simplecanvas.prototype.stopPinch=function(){
  console.log("stop pinching");
  this.ispinching=false;
}


simplecanvas.prototype.pinchDist=function(e){
    var x1 = Math.floor(e.originalEvent.touches[0].pageX/this.zoom);
    var y1 = Math.floor(e.originalEvent.touches[0].pageY/this.zoom);
    var x2 = Math.floor(e.originalEvent.touches[1].pageX/this.zoom);
    var y2 = Math.floor(e.originalEvent.touches[1].pageY/this.zoom);

    var mx=(x1+x2)/2;
    var my=(y1+y2)/2;
    var d=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1))|0;
    return d;
}




simplecanvas.prototype.respondCanvas=function(){
  //if(this.fullscreen){ 

    this.w=$(this.container).width();
    this.h=$(this.container).height();
    
  //$('#content').attr('height', w/rzoom-58); 

    //tamaño en pixels del canvas
    console.log("size changed",this.w,this.h);
    console.log(this);
    $(this.mycanvas).attr('width', this.w/this.zoom); //max width
     $(this.mycanvas).attr('height', this.h/this.zoom ); //max height
  //}

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
  if(this.stats){
     this.stats.end();
     this.stats.begin();
  }

    

 
      if(this.clearing || this.c==0){ 
        this.ctx.fillStyle=this.background;
        this.ctx.beginPath();
        this.ctx.fillRect(0,0,this.w,this.h);
      }

    this.onPaint(this);
   
    this.c++;

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

simplecanvas.prototype.doUpdate=function(e){


}

simplecanvas.prototype.doMove=function(e){


}
simplecanvas.prototype.doScale=function(scale){

}

/**
geo canvas

*/
function simplegeocanvas(div){
  //public properties
  this.showguides=false;


  //private
  this.div=div;
  this.center={'lat':0,'lng':0};
  this.dcenter={'lat':0,'lng':0};

  this.scale=50;
  this.dscale=this.scale;

  this.zoom=1;

  this.layers=new Array();
  
  //this.markers=new Array();

  this.sz=2; //size of marker
  this.roll=false; //current rolled marker
  this.selected=false; //current selected marker

  this.currentLayer="";
  this.rini={x:0,y:0};
  
  var self=this;
  /*
  setInterval(function(){
    self.hashPut();
  },1000);*/

}

simplegeocanvas.prototype = new simplecanvas(this.div );

simplegeocanvas.prototype.geo2pos=function(lat,lng){
  var x=Math.floor((-lat+this.center.lat)*this.scale+(this.h/2))|0;
  var y=Math.floor((lng-this.center.lng)*this.scale+(this.w/2))|0;
  return [x,y];
}

simplegeocanvas.prototype.pos2geo=function(x,y){
  var lat=-x/(this.scale);
  var lng=y/(this.scale);


  return [lat,lng];
}

simplegeocanvas.prototype.addMarker=function(m,layer){
  this.getLayer(layer).markers.push(m);
}


simplegeocanvas.prototype.doUpdate=function(){

  this.center.lat+=(this.dcenter.lat-this.center.lat)/2;
  this.center.lng+=(this.dcenter.lng-this.center.lng)/2;
  this.scale+=(this.dscale-this.scale)/2;

  var dtrigger=20;
  var dmin=100;
 
  this.roll=false;

    var num=this.layers.length;
     for(var l=0;l<num;l++){
      var num2=this.layers[l].markers.length;
         for(var c=0;c<num2;c++){


    var p=this.layers[l].markers[c];
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
}



     for(var l=0;l<num;l++){
      var num2=this.layers[l].markers.length;
         for(var c=0;c<num2;c++){
    var m=this.layers[l].markers[c];

    m.visible=false;
    m.roll=false;
   m.selected=false;

    var res=this.geo2pos(m.lat,m.lng);
    var x=res[1];
      if(x>0 && x<this.w){ 
      var y=res[0];
        if(y>0 && y<this.h){ 
            
              m.x=x;
              m.y=y;
              m.visible=true;
         }

    }


  }
}

  if(this.roll){
    this.roll.roll=true;
     this.onRoll(this.roll);
  }else{
    this.onRoll(false);
  }


}

simplegeocanvas.prototype.paint=function(e){

    if(this.stats)
    this.stats.begin();


    this.ctx.fillStyle =this.background;
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
    this.sz=Math.floor(this.scale/100000); //2000 is ok
    if(this.sz<1) this.sz=1;

     for(var l=0;l<this.layers.length;l++){
      var num2=this.layers[l].markers.length;
       //change color
      this.ctx.fillStyle = this.layers[l].color;
          this.ctx.strokeStyle = this.layers[l].color;

         for(var c=0;c<num2;c++){
         
          
          var p=this.layers[l].markers[c];
          //if(this.currentLayer=="" || p.layer==this.currentLayer){
            if(p.visible)
              p.paint(this.ctx,this.sz);

           //this.paintMarker(p);
         // }
        }

     }

     this.ctx.fillStyle = "ffff66";


 
     if(this.roll){
            
          var rolllayer=this.getLayerFromMarker(this.roll);
          this.roll.paintRoll(this.ctx,this.sz,rolllayer);
     }
     if(this.selected){
        var sellayer=this.getLayerFromMarker(this.selected);
          this.selected.paintSelected(this.ctx,this.sz,sellayer);
     }
  

  //if(this.selected!=-1) this.paintMarker(this.selected);
  //if(this.roll!=-1) this.paintMarker(this.roll);

  if(this.stats) this.stats.end();

}

/*
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
              //this.ctx.fillRect(x-this.sz,y-this.sz,this.sz*2,this.sz*2);

              this.ctx.arc(x,y,this.sz*2,0,2*Math.PI);
              this.ctx.fill();

              p.x=x;
              p.y=y;
              p.visible=true;
         }

    }
}*/

//todo change
simplegeocanvas.prototype.locExists=function(lat,lng,label){
  var layer=this.getLayer(label);
var num=layer.markers.length;
  for(var i=0;i<num;i++){
    var m=layer.markers[i];
    if(m.lat==lat){
      if(m.lng==lng){
        return true;
      }
    }
  }
  return false;

}

simplegeocanvas.prototype.getLayerFromMarker=function(mrk){
  var num=this.layers.length;
     for(var l=0;l<num;l++){
      var num2=this.layers[l].markers.length;
         for(var c=0;c<num2;c++){
          var m=this.layers[l].markers[c];
          if(m==mrk) return this.layers[l];
        }
      }
      console.log("no ha trobat");
      return false;
    }



simplegeocanvas.prototype.getLayer=function(label){
  for(var i=0;i<this.layers.length;i++){
    if(this.layers[i].label==label){
        return this.layers[i];
      }
    }
    return false;
}

simplegeocanvas.prototype.addLayer=function(color,label){
  this.layers.push({color:color,label:label,markers:new Array()});
}

//remove layer and all its markers
simplegeocanvas.prototype.removeLayer=function(label){
  for(var i=0;i<this.layers.length;i++){
    if(this.layers[i].label==label){
      this.layers.splice(i,1);
      return true;
    }

  }
  return false;
 
}

simplegeocanvas.prototype.setCenter=function(lat,lng){
 // this.center.lat=lat;
 // this.center.lng=lng;
  this.dcenter.lat=lat;
  this.dcenter.lng=lng;
}

simplegeocanvas.prototype.setScale=function(sc){
  this.dscale=sc;
}

simplegeocanvas.prototype.selectLayer=function(label){
  this.currentLayer=label;
}

simplegeocanvas.prototype.layersGetCenter=function(label){
  var res=new Array();
  for(var i=0;i<this.layers.length;i++){
    var r=this.layerGetCenter(this.layers[i].label);
    res.push(r);
  }
  var lat=0, lng=0, scale=0;
  for(var i=0;i<res.length;i++){
    lat+=res[i].lat;
    lng+=res[i].lng;
    scale+=res[i].scale;
  }
  lat=lat/res.length;
  lng=lng/res.length;;
  scale=25;
  return {'lat':lat,'lng':lng,'scale':scale};


}

simplegeocanvas.prototype.layerGetCenter=function(label){
   var layer=this.getLayer(label);

   if(layer.markers==undefined) return false;
    var lat=0;
    var lng=0;
    var count=0;
    var d=0;
    var countd=0;

    for(var c=0;c<layer.markers.length;c+=5){
      var p=layer.markers[c];
      
        lat+=p.lat;
        lng+=p.lng;
       // if(c%20){ //sampling distances
          d+=Math.sqrt( (p.lat-lat)*(p.lat-lat)+(p.lng-lng)*(p.lng-lng));
          countd++;

       // }
        count++;
     
    }

    lat=lat/count;
    lng=lng/count;

    /*
    for(var c=0;c<layer.markers.length;c++){
      var p=layer.markers[c];
        if(c%20){ //sampling distances
          d+=Math.sqrt( (p.lat-lat)*(p.lat-lat)+(p.lng-lng)*(p.lng-lng));
          countd++;

        }
     }
*/
    var res={};

    res.lat=lat;
    res.lng=lng;
    var averagedist=d/countd;

    var sc=2000000/averagedist;
     res.scale=this.dscale;
    if(this.dscale>sc) res.scale=sc;
   
   
   return res;


}

simplegeocanvas.prototype.centerLayers=function(label){
  var res=this.layersGetCenter(label);
   this.dcenter.lat=res.lat;
    this.dcenter.lng=res.lng;
    this.dscale=res.scale
}

simplegeocanvas.prototype.centerLayer=function(label){
   

    var res=this.layerGetCenter(label);
    if(!res){
      console.log("no hi ha markers");
      return false;
    } 
    console.log("centrant aqui",res);
    this.dcenter.lat=res.lat;
    this.dcenter.lng=res.lng;
    this.dscale=res.scale
   // this.dscale=sc;
  

}

simplegeocanvas.prototype.doScale=function(sc){
    this.dscale=this.dscale*sc;
    if(this.dscale>this.max_scale) this.dscale=this.max_scale;
    if(this.dscale<1) this.dscale=1;
     this.intentHash();;


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
   if(this.roll){
      this.selected=this.roll;
      this.selected.selected=true;
       this.onClick(this.roll);
   }else{
      var p=this.pos2geo(e.mouseX,e.mouseY);
        var size=this.pos2geo(this.w,this.h);
        //todo unify
    var lng=-p[0]+size[0]/2+this.center.lng;
    var lat=-p[1]+size[1]/2+this.center.lat;

      this.selected=false;;
       this.onClick({lat:lat,lng:lng});
   }
  
  }
}
simplegeocanvas.prototype.doMove=function(e){
  if(this.captured){ 
    var dx=e.mouseX-this.ini.x;
    var dy=e.mouseY-this.ini.y;
    var res=this.pos2geo(dy,dx);

    this.dcenter.lat-=res[0];
    this.dcenter.lng-=res[1];


    this.ini={x:e.mouseX,y:e.mouseY};
    this.intentHash();
   
    
  }
}

simplegeocanvas.prototype.intentHash=function(e){
 if(!this.hashing){
      this.hashing=true;
      var that = this;
      setTimeout(function(){
        that.hashPut();
      },2000);
    }
}

simplegeocanvas.prototype.onRoll=function(e){

}

simplegeocanvas.prototype.hashGet=function(e){
  var params=this.getHashParams();
  console.log(params);
  if(params.lat && params.lng){ 
   this.setCenter(parseFloat(params.lat),parseFloat(params.lng));
}
  if(params.scale){ 
   this.setScale(parseFloat(params.scale));
}
  this.onHashed(params);

}

simplegeocanvas.prototype.onHashed=function(hash){
  console.log("on hashed");
}

simplegeocanvas.prototype.hashPut=function(){
  //can become very slow
  var hash="lat="+round_number(this.center.lat,6);
  hash+="&lng="+round_number(this.center.lng,6);
  hash+="&scale="+parseInt(this.scale);
   hash+="&layers=";
  for(var i=0;i<this.layers.length;i++){
    hash+=""+this.layers[i].label+",";
  }
  this.addHash(hash);
  this.hashing=false;


}

simplegeocanvas.prototype.getHashParams=function(){

    var hashParams = {};
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&;=]+)=?([^&;]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.hash.substring(1);

    while (e = r.exec(q))
       hashParams[d(e[1])] = d(e[2]);

    return hashParams;
}


simplegeocanvas.prototype.addHash=function(hash){
  if(history.pushState) {
    history.pushState(null, null, '#'+hash);
  }
  else {
      location.hash = '#'+hash;
  }

}





//markers

function sgmarker(){
}

sgmarker.prototype.init=function(lat,lng,layer,txt){
  this.lat=lat;
  this.lng=lng;
  this.tag=layer;
  this.x=-1000;
  this.y=-1000;
  this.txt=txt;
  this.c=-Math.random()*10|0;
}

sgmarker.prototype.paint=function(ctx,sz){
  this.c++;
  if(this.c<0){
    return;
  }
   ctx.beginPath();
   //this.ctx.fillRect(x-this.sz,y-this.sz,this.sz*2,this.sz*2);
   
  // if(this.c<0){
     //  ctx.arc(this.x,this.y,sz*2*this.c*-1.01,0,2*Math.PI);
 //}else{
    ctx.arc(this.x,this.y,sz*2,0,2*Math.PI);
 
  //}
   ctx.fill();
}

sgmarker.prototype.paintRoll=function(ctx,sz,lay){


  ctx.fillStyle = "ffff66";
   ctx.beginPath();
   //this.ctx.fillRect(x-this.sz,y-this.sz,this.sz*2,this.sz*2);
   ctx.arc(this.x,this.y,sz*2,0,2*Math.PI);
   ctx.fill();

  ctx.lineWidth = 5;
    ctx.strokeStyle = lay.color;
   ctx.beginPath();

   //this.ctx.fillRect(x-this.sz,y-this.sz,this.sz*2,this.sz*2);
   ctx.arc(this.x,this.y,sz*2*10,0,2*Math.PI);
    ctx.stroke();

}

sgmarker.prototype.paintSelected=function(ctx,sz,lay){
  ctx.fillStyle = "ffff66";
   ctx.beginPath();
   //this.ctx.fillRect(x-this.sz,y-this.sz,this.sz*2,this.sz*2);
   ctx.arc(this.x,this.y,sz*2,0,2*Math.PI);
   ctx.fill();


  ctx.strokeStyle = lay.color;
   ctx.beginPath();
  ctx.lineWidth = 5;

   //this.ctx.fillRect(x-this.sz,y-this.sz,this.sz*2,this.sz*2);
   ctx.arc(this.x,this.y,sz*2*20,0,2*Math.PI);
   ctx.stroke();
}





//utilities


function round_number(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}


function get_random_color() {
   

    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}


function get_random_color_ex(){
  //120 different colors
  var ch=(Math.floor( Math.random()*30)*12);
  var s=80;
  //if(Math.random()>0.5) s+=20;
  // if(Math.random()>0.5) s+=20;
  var col=tinycolor({ h: ch, s: s, v: 100 });
  var color="rgba("+Math.floor(col._r)+","+Math.floor(col._g)+","+Math.floor(col._b)+","+0.7+")";
  return color;

}


