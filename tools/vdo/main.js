var isFirefox = navigator.userAgent.indexOf('Firefox') > -1
var isChrome = navigator.userAgent.indexOf('Chrome') > -1
var isEdge = navigator.userAgent.indexOf('Edg') > -1
var isSafari = navigator.userAgent.indexOf('Safari') > -1
if (isFirefox || isChrome || isEdge || isSafari) {
    if (!isChrome && isSafari) {
        alert("您正在使用Safari浏览器, 可能无法获取虚拟摄像头/麦克风.\n请考虑换用Chrome或Firefox内核的浏览器来进行串流!");
    }
} else {
    document.getElementById("main").innerHTML = "<br>请使用Chrome或Firefox内核的浏览器访问此页面!";
}

function start() {
    var Url2 = document.getElementById('client');
    Url2.select();
    document.execCommand('Copy');
    if (document.getElementById("autostart").checked) {
        alert('点击 [确定] 并授予摄像头权限以串流, 推流时请勿关闭浏览器.\n分享链接已经复制到您的剪贴板, 请发给对方即可.');
    } else {
        alert('点击 [确定] 并选择您要推流的是摄像头还是屏幕.\n请允许网站访问摄像头以进行串流, 推流时不要关闭浏览器.\n分享链接已经复制到您的剪贴板, 请发给对方即可.');
    }
    location = document.getElementById('server').value;
}

function getSelectText(id) {
    var obj = document.getElementById(id)
    var index = obj.selectedIndex;
    return obj.options[index].text;
}

function getSelectValue(id) {
    var obj = document.getElementById(id)
    var index = obj.selectedIndex;
    return obj.options[index].value;
}

function getSelectCheck(id, v1, v2) {
    var state = document.getElementById(id)
    if (state.checked) {
        return v1;
    } else {
        return v2;
    }
}

function switchAudio() {
    var audioSelector = document.getElementById("audioSelector");
    var mainDiv = document.getElementById("main");
    var audio = document.getElementById("audio")
    if (audio.checked) {
        audioSelector.style = "display: block"
        mainDiv.style = "height: 720px;";
    } else {
        audioSelector.style = "display: none"
        mainDiv.style = "height: 690px;";
    }
}

function advSettings() {
    var advSettings = document.getElementById("advSettings");
    var mainDiv = document.getElementById("main");
    var button = document.getElementById("advanced");
    var audio = document.getElementById("audio")
    if (button.innerHTML == "显示高级选项") {
        button.innerHTML = "隐藏高级选项"
        advSettings.style = "display: block;";
        mainDiv.style = "height: 690px;";
        if (audio.checked) {
            mainDiv.style = "height: 720px;";
        }
    } else {
        button.innerHTML = "显示高级选项"
        advSettings.style = "display: none;"
        mainDiv.style = "height: 425px;";
        if (audio.checked) {
            mainDiv.style = "height: 455px;";
        }
    }
}

function generateURL() {
    var password = document.getElementById("password").value
    if (password != "") {
        password = "&p=" + password
    }

    var screens = getSelectCheck("screen", "", "&wc")
    if (screens == "") {
        document.getElementById("autostart").checked = 0;
    } else {
        document.getElementById("autostart").checked = 1;
    }

    var audioLabel = getSelectCheck("audio", "", "&ad=0")
    if (audioLabel == "") {
        audioLabel = "&ad=" + encodeURIComponent(getSelectText("audioSource"))
    }

    var cameraLabel = "&vd=" + encodeURIComponent(getSelectText("videoSource"));
    var server = document.getElementById("server");
    var client = document.getElementById("client");
    var vb = "&vb=" + document.getElementById("vb").value;
    var roomID = document.getElementById("room").value;
    var quality = "&q=" + getSelectValue("quality");
    var codec = "&codec=" + getSelectValue("codec");
    var autostart = getSelectCheck("autostart", "&as", "")
    var mirror = getSelectCheck("mirror", "&mirror", "")

    var serverUrl = "https://vdo.ninja/?ln=cn&push=" + roomID + cameraLabel + audioLabel + quality + mirror + screens + autostart + password
    var clientUrl = "https://vdo.ninja/?cv&view=" + roomID + codec + vb + password
    server.value = serverUrl
    client.value = clientUrl
}

function random(char) {　　
    len = 16 || 32;　　
    var $chars = char;　　
    var maxPos = $chars.length;　　
    var pwd = '';　　
    for (i = 0; i < len; i++) {　　　　
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));　　
    }
    return pwd;
}

function randomRoomID() {
    var room = document.getElementById('room');
    room.value = random('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
    room = null;
}

function randomPwd() {
    var pwd = document.getElementById('password');
    pwd.value = random('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890');
    pwd = null;
}
randomRoomID()
randomPwd()
