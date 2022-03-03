
let videoSourcesSelect = document.getElementById("videoSource");
let audioSourcesSelect = document.getElementById("audioSource");
let videoPlayer = document.getElementById("player");

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

// Create Helper to ask for permission and list devices
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
getDevice();
