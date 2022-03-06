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
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    /*if (w<464||h<464) {
        if (h<464&&!isOBS){document.getElementById("main").style.margin="0em auto"}
        document.getElementById("main").style.transform = 'scale('+Math.min(w,h)/464+')';
    }else{
        if (!isOBS){document.getElementById("main").style.margin="5em auto"}
        document.getElementById("main").style.transform = '';
    }*/
    if (w<widthOfMain) {
        main.style.transform = 'scale('+w/widthOfMain+')';
    }else{
        if (isMobile){
            main.style.boxShadow = 'none'
            main.style.transformOrigin = '50% 0'
            var scale = (w/(widthOfMain+30))
            main.style.transform = 'scale('+scale+')'
            main.style.margin = scale+"em auto"
        }else{
            if (!isOBS){main.style.margin="5em auto"}
            main.style.transform = '';
        }
    }
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
    if (isOBS) {
        widthOfMain = 432;
    }else if (isFirefox || isChrome || isEdge) {
        loadStyles('./css/settings.css');
    }else if (isSafari) {
        loadStyles('./css/settings.css');
        if (!isMobile){document.getElementById("safariNote").innerHTML = "您正在使用Safari浏览器, 可能无法获取虚拟摄像头/麦克风.<br>请考虑换用Chrome或Firefox内核的浏览器来进行串流!"}
        //alert("您正在使用Safari浏览器, 可能无法获取虚拟摄像头/麦克风.\n请考虑换用Chrome或Firefox内核的浏览器来进行串流!");
    } else {
        loadStyles('./css/settings.css');
        main.innerHTML = "<br>请使用Chrome或Firefox内核的浏览器访问此页面!";
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
            if (isOBS) {main.innerHTML = "<b>获取媒体信息失败!<br>请为 OBS 添加下列启动参数以允许媒体访问.<br> --enable-media-stream --enable-media-stream";}
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
        if (simple!="1"){videoPlayer.srcObject = stream;}

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
            generateURL();
        }).catch(function (e) {
            //console.log(e.name + ": " + e.message);
            alert("获取设备失败!");
            if (isOBS) {document.getElementById("main").innerHTML = "<b>获取媒体信息失败!<br>请为 OBS 添加下列启动参数以允许媒体访问.<br> --enable-media-stream --enable-media-stream";}
        });
    }).catch(function (err) {
        //console.error(err);
        main.innerHTML = "<b>无法获取摄像头! 请确认您的设备已连接摄像头,<br>且已经授予本页面摄像头访问权, 之后刷新重试.";
        if (isOBS) {main.innerHTML = "<b>获取媒体信息失败!<br>请为 OBS 添加下列启动参数以允许媒体访问.<br> --enable-media-stream --enable-media-stream";}
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
        var iframe = document.createElement('iframe'); 
        iframe.src = url;
        iframe.id = "ninja";
        iframe.style = "width: 348px; height: 196px; border-radius: 4px;";
        if (simple == "1"){iframe.style = "display: none";}
        iframe.allow = "camera;microphone";
        iframe.frameBorder="0";
        iframe.setAttribute("frameBorder", "0");
        videoPlayer.parentNode.insertBefore(iframe,videoPlayer);
        document.getElementById('hiddenClient').select();
        document.execCommand('Copy');
        //alert("观看链接已经复制到您的剪贴板, 请发给对方即可.");
    } else {
        btn.innerHTML = "开始串流";
        btn.className = "btn";
        copyBtn.style.display = "none";
        document.getElementById("ninja").remove();
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
    var camIndex;
    for (i = 0; i < videoSource.length; i++) {
        if (videoSource[i].text == "VTubeStudioCam" || videoSource[i].text == "NDI Video") {
            camIndex = i;
            videoSource[i].selected = true;
            MediaStreamHelper.requestStream().then(function (stream) {
                MediaStreamHelper._stream = stream;
                videoPlayer.srcObject = stream;
            });
            generateURL();
            break;
        }
    }
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
    if (password != "") { password = "&p=" + password; }
    //var autoPause = getSelectCheck("autoPause", "&optimize=0", "")
    var camera = getSelectText("videoSource");
    var cameraLabel = "&vd=" + encodeURIComponent(camera);
    if (isMobile){
        var index = document.getElementById("videoSource").selectedIndex;
        if (index == 1){cameraLabel = "&facing=back"}
    }
    var mirror = getSelectCheck("mirror", "&mirror", "");
    if (camera == "VTubeStudioCam") { mirror = "&mirror"; }
    var server = document.getElementById("server");
    var client = document.getElementById("client");
    var hiddenClient = document.getElementById("hiddenClient");
    var vb = "&vb=" + document.getElementById("vb").value;
    var roomID = document.getElementById("room").value;
    var quality = "&q=" + getSelectValue("quality");
    var codec = "&codec=" + getSelectValue("codec");
    var serverUrl = "https://vdo.ninja/?ln=cn&as&wc&fullscreen&cleanish&ad=0&push=" + roomID + cameraLabel + quality + mirror + password
    var clientUrl = "https://vdo.ninja/?cv&view=" + roomID + codec + vb + password
    server.value = serverUrl;
    client.value = clientUrl;
    hiddenClient.value = clientUrl;
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
var widthOfMain = 464;
let videoSourcesSelect = document.getElementById("videoSource");
let videoPlayer = document.getElementById("player");
let main = document.getElementById("main");
var resizeTimer;

precheck();
resize();
randomRoomID();
randomPwd();
getDevice();

window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        resize();
    }, 250);
});

if (dark=="1"){
    if (isOBS){
        loadStyles('./css/dark_obs.css')
    }else {
        loadStyles('./css/dark.css')
    }
}

if (isMobile){
    document.getElementById('codec')[1].selected = true;
}

if (simple){
    if (isOBS){document.body.style.overflow = "hidden";}
    videoPlayer.style.display = "none";
    document.getElementById('banner').style.display = "none";
    document.getElementById('thanks').style.display = "none";
}

videoSourcesSelect.onchange = function () {
    if (simple!="1"){
        MediaStreamHelper.requestStream().then(function (stream) {
            MediaStreamHelper._stream = stream;
            videoPlayer.srcObject = stream;
        });
    }
    generateURL();
};