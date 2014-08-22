var pathName = location.pathname.toLowerCase();

pathName = pathName.replace("default", "");
pathName = pathName.replace("home", "");
pathName = pathName.replace("printpreview", "");
pathName = pathName.replace("edit", "");
pathName += ((pathName.substring(pathName.length - 1) != "/") ? "/" : "");
pathName = location.protocol + "//" + location.host + pathName.replace("//", "/");

$(document).ready(function () {

});