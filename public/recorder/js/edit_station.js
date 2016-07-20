function GetCookie (name)
{
   var arg = name + "=";
   var alen = arg.length;
   var clen = document.cookie.length;
   var i = 0;
   while (i < clen)
   {
       var j = i + alen;
       if (document.cookie.substring(i, j) == arg)
       return getCookieVal (j);
       i = document.cookie.indexOf(" ", i) + 1;
       if (i == 0) break;
   }
 return null;
}

function getCookieVal (offset)
{
   var endstr = document.cookie.indexOf (";", offset);
   if (endstr == -1)
     endstr = document.cookie.length;
     return unescape(document.cookie.substring(offset, endstr));
   }
function SetCookie (name, value)
{
     document.cookie = name + "=" + escape (value)
}

function check_null(){
        if (document.useradd.name.value==""){
            alert('"用户姓名" 不能为空');
            return false;
        }
　　　　if (document.useradd.mail.value==""){
            alert('"Mail" 不能为空');
            return false;
        }
　　　　if (document.useradd.mobile.value==""){
            alert('"手机号码" 不能为空');
            return false;
        }
        return true;
}
function check_server_null(){
        if (document.serveradd.inet_addr_0.value==""){
            alert('"外网IP" 不能为空');
            return false;
        }
　　　　if (document.serveradd.inet_addr_1.value==""){
            alert('"内网IP" 不能为空');
            return false;
        }
　　　　if (document.serveradd.hostname.value==""){
            alert('"主机名" 不能为空');
            return false;
        }
        return true;
}
function check_add_null(){
　　　　if (document.add.name.value==""){
            alert('"名称" 不能为空');
            return false;
        }
        return true;
}

