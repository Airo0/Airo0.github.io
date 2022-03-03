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
let audioSourcesSelect = document.getElementById("audioSource");
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

            const audioSource = audioSourcesSelect.value;
            const videoSource = videoSourcesSelect.value;
            const constraints = {
                audio: {
                    deviceId: audioSource ? {
                        exact: audioSource
                    } : undefined
                },
                video: {
                    deviceId: videoSource ? {
                        exact: videoSource
                    } : undefined
                }
            };

            return navigator.mediaDevices.getUserMedia(constraints);
        }
};

videoSourcesSelect.onchange = function () {
    MediaStreamHelper.requestStream().then(function (stream) {
        MediaStreamHelper._stream = stream;
        videoPlayer.srcObject = stream;
    });
    if (getSelectText("videoSource") == "VTubeStudioCam") {
        document.getElementById("mirror").checked = 1;
    } else {
        document.getElementById("mirror").checked = 0;
    }
    generateURL();
};

audioSourcesSelect.onchange = function () {
    MediaStreamHelper.requestStream().then(function (stream) {
        MediaStreamHelper._stream = stream;
        videoPlayer.srcObject = stream;
    });
    generateURL();
};

function getDevice() {
    videoSourcesSelect.innerHTML = "";
    audioSourcesSelect.innerHTML = "";
    // Request streams (audio and video), ask for permission and display streams in the video element
    MediaStreamHelper.requestStream().then(function (stream) {
        console.log(stream);
        // Store Current Stream
        MediaStreamHelper._stream = stream;

        // Select the Current Streams in the list of devices
        audioSourcesSelect.selectedIndex = [...audioSourcesSelect.options].findIndex(option => option.text === stream.getAudioTracks()[0].label);
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
                    option.text = device.label || `Microphone ${videoSourcesSelect.length + 1}`;
                    audioSourcesSelect.appendChild(option);
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
    document.getElementById('hiddenClient').select();
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
            if (videoSource[i].text == "VTubeStudioCam") { document.getElementById("mirror").checked = 1; }
            generateURL();
            break;
        }
    }
    if (camIndex) {
        var msg = "检测到 " + videoSource[camIndex].text + " 虚拟摄像头, 是否立即开始串流?";
        if (confirm(msg) == true) { start(); }
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
    var password = document.getElementById("password").value;
    if (password != "") {
        password = "&p=" + password
    }

    var screens = getSelectCheck("screen", "", "&wc");
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
    var hiddenClient = document.getElementById("hiddenClient");
    var vb = "&vb=" + document.getElementById("vb").value;
    var roomID = document.getElementById("room").value;
    var quality = "&q=" + getSelectValue("quality");
    var codec = "&codec=" + getSelectValue("codec");
    var autostart = getSelectCheck("autostart", "&as", "");
    var mirror = getSelectCheck("mirror", "&mirror", "");

    var serverUrl = "https://vdo.ninja/?ln=cn&push=" + roomID + cameraLabel + audioLabel + quality + mirror + screens + autostart + password
    var clientUrl = "https://vdo.ninja/?cv&view=" + roomID + codec + vb + password
    server.value = serverUrl;
    client.value = clientUrl;
    hiddenClient.value = clientUrl;
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

randomRoomID();
randomPwd();
getDevice();
