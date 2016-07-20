/*! Copyright 2009 Ask Bjørn Hansen
    see http://www.v6test.develooper.com/
 */
;jQuery.cookie=function(b,j,m){if(typeof j!="undefined"){m=m||{};
if(j===null){j="";m.expires=-1;}var e="";if(m.expires&&(typeof m.expires=="number"||m.expires.toUTCString)){var f;
if(typeof m.expires=="number"){f=new Date();f.setTime(f.getTime()+(m.expires*24*60*60*1000));}else{f=m.expires;
}e="; expires="+f.toUTCString();}var l=m.path?"; path="+(m.path):"";var g=m.domain?"; domain="+(m.domain):"";
var a=m.secure?"; secure":"";document.cookie=[b,"=",encodeURIComponent(j),e,l,g,a].join("");}else{var d=null;
if(document.cookie&&document.cookie!=""){var k=document.cookie.split(";");for(var h=0;h<k.length;h++){var c=jQuery.trim(k[h]);
if(c.substring(0,b.length+1)==(b+"=")){d=decodeURIComponent(c.substring(b.length+1));break;}}}return d;
}};
/*! Copyright 2009-2010 Ask Bjørn Hansen
    see http://www.v6test.develooper.com/
 */
;"use strict";
var v6=v6||{};v6.version="1.25";v6.hosts=["ipv4","ipv6","ipv64"];v6.timeout=4;v6.api_server="http://www.v6test.develooper.com/";
var $target;v6.check_timeout=function(){var a=(new Date).getTime();if(a-v6.start_timer>(v6.timeout*1000)){v6.submit_results();
}else{v6.timer=setTimeout(function(){v6.check_timeout();},500);}};v6.submit_results=function(){var e="version="+v6.version;
for(var c=0;c<v6.hosts.length;c++){var d=v6.hosts[c];e+="&"+d+"=";if(v6.status[d]&&v6.status[d]=="ok"){var a=v6.times[d];
e+=a;e+="&"+d+"_ip="+v6.ip[d];if($target){$target.append(d+": ok<br>");}}else{e+=v6.status[d];if($target){$target.append(d+": failed<br>");
}}}var b=$.cookie("v6uq");if(!b){b=v6.uuid();}e+="&v6uq="+b;e+="&site="+v6.site;jQuery.getJSON(v6.api_server+"/c/json?callback=?",e,function(g){if(g.ok&&$target){$target.append("<br>Results submitted, thanks!");
}var f=v6.path||"/";$.cookie("v6uq",b,{expires:10,path:f});});};v6.get_ip=function(b){var a="http://"+b+".v6test.develooper.com/c/ip?callback=?";
jQuery.getJSON(a,"",function(c){if(c.ip){v6.ip[b]=c.ip;}});};v6.check_count=function(){if(v6.images_loaded==v6.images){for(var a=0;
a<v6.hosts.length;a++){var b=v6.hosts[a];if(v6.status[b]=="ok"&&!v6.ip[b]){return;}}if(v6.timer){clearTimeout(v6.timer);
}v6.submit_results();}};v6.test=function(){setTimeout(function(){(new Image()).src="http://"+v6.uuid()+".mapper.ntppool.org/none";
},3200);if(v6.only_once){if($.cookie("v6uq")){return;}}document.write('<div id="v6test"></div>');v6.times={};
v6.status={};v6.ip={};$(window).load(function(){if(v6.target){$target=$(v6.target);$target.append("Testing ipv4 and ipv6 connectivity:");
}v6.images=v6.hosts.length;v6.images_loaded=0;var a="";for(var b=0;b<v6.hosts.length;b++){var c=v6.hosts[b];
a+='<img id="v6test_img_'+c+'" class="v6test_test_img"  src="http://'+c+'.v6test.develooper.com/i/t.gif" width="1" height="1">';
}$("#v6test").append(a);v6.start_timer=(new Date).getTime();$("img.v6test_test_img").load(function(){var e=(new Date).getTime();
var f=$(this).attr("id");var d=f.slice(11);v6.times[d]=e-v6.start_timer;v6.status[d]="ok";$(this).data("isLoaded",true);
v6.images_loaded++;v6.check_count();v6.get_ip(d);});$("img.v6test_test_img").error(function(){var e=$(this).attr("id");
var d=e.slice(11);v6.status[d]="error";v6.images_loaded++;v6.check_count();});v6.timer=setTimeout(function(){v6.check_timeout();
},1000);});};v6.uuid=function(){var e="0123456789abcdef".split("");var c=[],b=Math.random,d;c[8]=c[13]=c[18]=c[23]="-";
c[14]="4";for(var a=0;a<36;a++){if(!c[a]){d=0|b()*16;c[a]=e[(a==19)?(d&3)|8:d&15];}}return c.join("");
};