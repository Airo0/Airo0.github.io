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
    if (r != null) return unescape(r[2]); return '';
}

function resize(){
    if (!isMobile){
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        var min = Math.min(w,h)
        var mainW = main.offsetWidth;
        var mainH = main.offsetHeight;
        var margin = Math.max((h-mainH)/2,0)
        if (simple) margin = -10
        if ( w<mainW || h<mainH ) {
            var scale = Math.min(w/mainW,h/mainH);
            if (simple) scale = Math.min(w/mainW,1)
            main.style.margin = margin+"px "+Math.max((w-mainW*scale)/2,0)+"px"
            main.style.transform = 'scale('+scale+')';
        }else{
            main.style.margin = margin+"px auto"
            main.style.transform = '';
        }
    }
}

function resizeMobile() {
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    var min = Math.min(w,h)
    var mainW = main.offsetWidth;
    var mainH = main.offsetHeight;
    main.style.boxShadow = 'none'
    var scale = Math.min(w/mainW,h/mainH);
    main.style.margin = "0em "+Math.max((w-mainW*scale)/2,0)+"px"
    main.style.transform = 'scale('+scale+')';
}

function isMobile() {
    var mobileAgents = [ "Android", "iPhone", "SymbianOS", "Windows Phone", "iPad","iPod"];
    var mobile_flag = false;
    for (var v = 0; v < mobileAgents.length; v++) {
        if (ua.indexOf(mobileAgents[v]) > 0) {
            mobile_flag = true;
            break;
        }
    }
    if (mobile_flag == false){
        mobile_flag = (/iPad|iPhone|iPod/.test(navigator.platform) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
        !window.MSStream
    }
    return mobile_flag;
}

function precheck() {
    if (!isMobile && !isOBS) {
        loadStyles('./css/settings.css');
        if (!isFirefox && !isChrome && !isEdge && !isSafari) main.innerHTML = "<br>请使用Chrome或Firefox内核的浏览器访问此页面!";
        if (isSafari && !isChrome) document.getElementById("safariNote").innerHTML = "您正在使用Safari浏览器, 可能无法获取虚拟摄像头/麦克风.<br>请考虑换用Chrome或Firefox内核的浏览器来进行串流!";
    }else if (isMobile) {
        loadStyles('./css/settings_mobile.css')
        document.getElementById('codec')[1].selected = true;
        document.getElementById('lock').style.display = 'inline';
        videoSourcesSelect.style.width = '110px';
        resizeMobile();
    }
    if (dark=="1"){
        loadStyles('./css/dark_obs.css');
        if (!isOBS) loadStyles('./css/dark.css')
    }
    if (simple){
        if (isOBS) document.body.style.overflow = "hidden";
        videoPlayer.style.display = "none";
        document.getElementById('banner').style.display = "none";
        document.getElementById('thanks').style.display = "none";
    }
}

let MediaStreamHelper = {
    // Property of the object to store the current stream
    _stream: null,
    // This method will return the promise to list the real devices
    getDevices: function () {
        return navigator.mediaDevices.enumerateDevices();
    },
    // Request user permissions to access the camera and video
    requestStream: function () {
        if (this._stream) {
            this._stream.getTracks().forEach(track => {
                track.stop();
            });
        }
        
        const videoSource = videoSourcesSelect.value;
        const constraints = {
            video: {
                deviceId: videoSource ? {
                    exact: videoSource
                } : undefined
            }
        };
        try {
            return navigator.mediaDevices.getUserMedia(constraints);
        }catch (e){
            main.innerHTML = "<b>获取媒体信息失败!<br>请确认浏览器是否支持 getUserMedia() 功能.<br>并确定本页面是从可信的HTTPS服务器所加载.";
            if (isOBS) main.innerHTML = "<b>获取媒体信息失败!<br>请为 OBS 添加下列启动参数以允许媒体访问.<div style='font-size: 14px'>--enable-media-stream --use-fake-ui-for-media-stream</div>";
        }
    },
	
	stopStream: function () {
		if (this._stream) {
            this._stream.getTracks().forEach(track => {
                track.stop();
            });
        }
	}
};

function getDevice() {
    videoSourcesSelect.innerHTML = '';
    // Request video stream, ask for permission and display streams in the video element
    MediaStreamHelper.requestStream().then(function (stream) {
        console.log(stream);
        // Store Current Stream
        MediaStreamHelper._stream = stream;

        // Select the Current Streams in the list of devices
        videoSourcesSelect.selectedIndex = [...videoSourcesSelect.options].findIndex(option => option.text === stream.getVideoTracks()[0].label);

        // Play the current stream in the Video element
        if (simple!="1") videoPlayer.srcObject = stream;

        // You can now list the devices using the Helper
        MediaStreamHelper.getDevices().then((devices) => {
            // Iterate over all the list of devices (InputDeviceInfo and MediaDeviceInfo)
            devices.forEach((device) => {
                let option = new Option();
                option.value = device.deviceId;

                // According to the type of media device
                switch (device.kind) {
                    // Append device to list of Cameras
                case "videoinput":
                    option.text = device.label || `Camera ${videoSourcesSelect.length + 1}`;
                    videoSourcesSelect.appendChild(option);
                    break;
                    // Append device to list of Microphone
                case "audioinput":
                    break;
                }
                console.log(device);

            });
            checkVTS();
        }).catch(function (e) {
            //console.log(e.name + ": " + e.message);
            main.innerHTML = "<b>无法列出摄像头!<br>请确认您的设备已连接摄像头并授予权限.<br>且确定本页面是从可信的HTTPS服务器所加载.";
            if (isOBS) document.getElementById("main").innerHTML = "<b>获取媒体信息失败!<br>请为 OBS 添加下列启动参数以允许媒体访问.<div style='font-size: 14px'>--enable-media-stream --use-fake-ui-for-media-stream</div>";
        });
    }).catch(function (err) {
        //console.error(err);
        main.innerHTML = "<b>无法获取摄像头! 请确认您的设备已连接摄像头,<br>且已经授予本页面摄像头访问权, 之后刷新重试.";
        if (isOBS) main.innerHTML = "<b>获取媒体信息失败!<br>请为 OBS 添加下列启动参数以允许媒体访问.<div style='font-size: 14px'>--enable-media-stream --use-fake-ui-for-media-stream</div>";
    });
}

function start() {
    var btn = document.getElementById("start");
    var copyBtn = document.getElementById("copy");
    if (btn.innerHTML == "开始串流"){
        MediaStreamHelper.stopStream();
        btn.innerHTML = "正在串流, 点击可停止...";
        btn.className = "streaming";
        copyBtn.style.display = "";
        videoPlayer.style.display = "none";
        document.getElementById("basic").style = "display: none;";
        document.getElementById("advSettings").style = "display: none;";
        var url = document.getElementById("server").value;
        ninja.src = url;
        if (simple != "1") ninja.style.display = "inherit";
        document.getElementById('hiddenClient').select();
        document.execCommand('Copy');
        //alert("观看链接已经复制到您的剪贴板, 请发给对方即可.");
    } else {
        btn.innerHTML = "开始串流";
        btn.className = "btn";
        copyBtn.style.display = "none";
        ninja.remove();
        generateURL();
        if (simple != "1"){
            MediaStreamHelper.requestStream().then(function (stream) {
                MediaStreamHelper._stream = stream;
                videoPlayer.srcObject = stream;
            });
            videoPlayer.style.display = "";
        }
        document.getElementById("basic").style = "display: block;";
    }
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

function checkVTS() {
    var videoSource = document.getElementById("videoSource");
    videoSource[videoSource.length-1].selected = true;
    for (i = 0; i < videoSource.length; i++) {
        if (videoSource[i].text == "VTubeStudioCam" || videoSource[i].text == "NDI Video") {
            videoSource[i].selected = true;
            break;
        }
    }
    generateURL();
    MediaStreamHelper.requestStream().then(function (stream) {
        MediaStreamHelper._stream = stream;
        videoPlayer.srcObject = stream;
    });
}

function switchMirror() {
	var check = document.getElementById("mirror").checked;
    if (check) {
        videoPlayer.style.transform = "scaleX(-1)";
    } else {
        videoPlayer.style.transform = "scaleX(1)";
    }
}

function advSettings() {
    var advSettings = document.getElementById("advSettings");
    var mainDiv = document.getElementById("main");
    var btn1 = document.getElementById("advanced");
    if (btn1.innerHTML == "显示高级选项") {
        btn1.innerHTML = "隐藏高级选项"
        advSettings.style = "display: block;";
    } else {
        btn1.innerHTML = "显示高级选项"
        advSettings.style = "display: none;"
    }
}

function generateURL() {
    var password = document.getElementById("password").value;
    if (password != "") password = "&p=" + password;
    //var autoPause = getSelectCheck("autoPause", "&optimize=0", "")
    var camera = getSelectText("videoSource");
    var cameraLabel = "&vd=" + encodeURIComponent(camera);
    if (isMobile){
        var index = document.getElementById("videoSource").selectedIndex;
        if (index == 1) cameraLabel = "&facing=back";
    }
    var mirror = getSelectCheck("mirror", "&mirror", "");
    if (camera == "VTubeStudioCam") mirror = "&mirror";
    var server = document.getElementById("server");
    var client = document.getElementById("client");
    var hiddenClient = document.getElementById("hiddenClient");
    var vb = "&vb=" + document.getElementById("vb").value;
    var roomID = document.getElementById("room").value;
    var quality = getSelectValue("quality");
    var codec = getSelectValue("codec");
    var rotation = getSelectValue("lockRotation");
    var serverUrl = "https://vdo.ninja/?ln=cn&as&wc&fullscreen&cleanish&ad=0&push=" + roomID + cameraLabel + quality + mirror + rotation + password
    var clientUrl = "https://vdo.ninja/?cv&view=" + roomID + codec + vb + password
    server.value = serverUrl;
    client.value = clientUrl;
    hiddenClient.value = clientUrl;
}

function setRotation(rota) {
    if (rota == "&fl") {
        ninja.style.width = "348px";
        ninja.style.height = "261px";
    }else{
        ninja.style.width = "261px";
        ninja.style.height = "464px";
    }
}

function random(char) {　　
    len = 12 || 32;　　
    var $chars = char;　　
    var maxPos = $chars.length;　　
    var str = '';　　
    for (i = 0; i < len; i++) {　　　　
        str += $chars.charAt(Math.floor(Math.random() * maxPos));　　
    }
    return str;
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


var ua = navigator.userAgent
var isFirefox = ua.indexOf('Firefox') > -1
var isChrome = ua.indexOf('Chrome') > -1
var isEdge = ua.indexOf('Edg') > -1
var isSafari = ua.indexOf('Safari') > -1
var isOBS = ua.indexOf('OBS') > -1
var isMobile = isMobile();
var simple = getQueryString("simple");
var dark = getQueryString("dark");
let main = document.getElementById("main");
let videoSourcesSelect = document.getElementById("videoSource");
let videoPlayer = document.getElementById("player");
var ninja = document.getElementById('ninja'); 
var resizeTimer;

precheck();
resize();
randomRoomID();
randomPwd();
getDevice();

videoSourcesSelect.onchange = function () {
    if (simple!="1"){
        MediaStreamHelper.requestStream().then(function (stream) {
            MediaStreamHelper._stream = stream;
            videoPlayer.srcObject = stream;
        });
    }
    generateURL();
};
window.addEventListener('orientationchange', function() {
    setTimeout(function () {resizeMobile()},200);
});