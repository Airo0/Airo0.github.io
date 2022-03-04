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

let videoSourcesSelect = document.getElementById("videoSource");
let videoPlayer = document.getElementById("player");
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
        return navigator.mediaDevices.getUserMedia(constraints);
    },
	
	stopStream: function () {
		if (this._stream) {
            this._stream.getTracks().forEach(track => {
                track.stop();
            });
        }
	}
};

videoSourcesSelect.onchange = function () {
    MediaStreamHelper.requestStream().then(function (stream) {
        MediaStreamHelper._stream = stream;
        videoPlayer.srcObject = stream;
    });
    generateURL();
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
        videoPlayer.srcObject = stream;

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
            console.log(e.name + ": " + e.message);
        });
    }).catch(function (err) {
        console.error(err);
    });
}

function start() {
    var btn = document.getElementById("start");
    if (btn.innerHTML == "开始串流"){
        MediaStreamHelper.stopStream();
        btn.innerHTML = "正在串流, 点击可停止...";
        btn.className = "streaming";
        document.getElementById("basic").style = "display: none;";
        document.getElementById("advSettings").style = "display: none;";
        videoPlayer.style.display = "none";
        var url = document.getElementById("server").value;
        var iframe = document.createElement('iframe'); 
        iframe.src = url;
        iframe.id = "ninja";
        iframe.style = "width: 348px; height: 196px; border-radius: 4px;";
        iframe.allow = "camera;microphone";
        iframe.frameBorder="0";
        iframe.setAttribute("frameBorder", "0");
        videoPlayer.parentNode.insertBefore(iframe,videoPlayer);
        document.getElementById('hiddenClient').select();
        document.execCommand('Copy');
        alert("分享链接已经复制到您的剪贴板, 请发给对方即可.");
    } else {
        btn.innerHTML = "开始串流";
        btn.className = "btn";
        document.getElementById("ninja").remove();
		MediaStreamHelper.requestStream();
		MediaStreamHelper.requestStream().then(function (stream) {
			MediaStreamHelper._stream = stream;
			videoPlayer.srcObject = stream;
		});
		generateURL();
		videoPlayer.style.display = "";
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

randomRoomID();
randomPwd();
getDevice();
