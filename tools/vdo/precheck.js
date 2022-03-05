function loadStyles(url) {
	var link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	document.getElementsByTagName("head")[0].appendChild(link);
}

function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]); return null;
}

var ua = navigator.userAgent
var isFirefox = ua.indexOf('Firefox') > -1
var isChrome = ua.indexOf('Chrome') > -1
var isEdge = ua.indexOf('Edg') > -1
var isSafari = ua.indexOf('Safari') > -1
var isOBS = ua.indexOf('OBS') > -1
if (isOBS) {
	loadStyles('./settings_obs.css');
}else if (isFirefox || isChrome || isEdge) {
	loadStyles('./settings.css');
}else if (isSafari) {
	loadStyles('./settings.css');
	alert("您正在使用Safari浏览器, 可能无法获取虚拟摄像头/麦克风.\n请考虑换用Chrome或Firefox内核的浏览器来进行串流!");
} else {
	document.getElementById("main").innerHTML = "<br>请使用Chrome或Firefox内核的浏览器访问此页面!";
}

function resize(){
	var w = document.documentElement.clientWidth;
	var h = document.documentElement.clientHeight;
	if (w<464||h<464) {
		if (h<464&&!isOBS){document.getElementById("main").style.margin="0em auto"}
		document.getElementById("main").style.transform = 'scale('+Math.min(w,h)/464+')';
	}else{
		if (!isOBS){document.getElementById("main").style.margin="5em auto"}
		document.getElementById("main").style.transform = '';
	}
}
var resizeTimer;
window.addEventListener('resize', function() {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(function() {
		resize();
	}, 250);
});
