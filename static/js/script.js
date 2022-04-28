var constraints = { audio: true };
var localStream;
var socket;
const time=1000;
const usrStatus = {
	id:"testUser",
	channel:null,
	name:"testUser",
	online:true,
	mic:false,
	speaker:true,
}
window.onload=function(){
	socket=io.connect('/');
socket.on("audio", function (data) {
	if(!usrStatus.speaker) return;
    var audio = new Audio(data);
    audio.play();
  });
	var old = sessionStorage.getItem("id")!=null
	usrStatus.id=old ?sessionStorage.getItem("id") : Math.floor(Math.random()*10000000000);
	usrStatus.name=old ? sessionStorage.getItem("name") :prompt("Enter your name","idiot")
	usrStatus.channel=old ? sessionStorage.getItem("channel"):prompt("Enter a Channel Id to join", Math.floor(Math.random()*1000000000))
	if(usrStatus.name==null || usrStatus.channel==null) 
		location.href="/"
getBlock("name").innerText=usrStatus.name;
getBlock("id").innerText=usrStatus.id;
getBlock("room").innerText=usrStatus.channel;


}
function muteOutgoing(e){
usrStatus.mic=!usrStatus.mic
e.setAttribute("src",!usrStatus.mic ? "/static/img/micMute.svg" : "/static/img/mic.svg")
socket.emit("usrInfo",usrStatus)
	if(!usrStatus.mic){
		stop();
		return
	}
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    var mediaRecorder = new MediaRecorder(stream);
	localStream=stream
    mediaRecorder.start();

    var audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", function (event) {

      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", function () {
      var audioBlob = new Blob(audioChunks);

      audioChunks = [];

      var fileReader = new FileReader();
      fileReader.readAsDataURL(audioBlob);
      fileReader.onloadend = function () {
//        if (!userStatus.microphone || !userStatus.online) return;

        var base64String = fileReader.result;
        socket.emit("stream", base64String);

      };

      mediaRecorder.start();


      setTimeout(function () {
        mediaRecorder.stop();
      }, time);
    });

    setTimeout(function () {
      mediaRecorder.stop();
    }, time);
  });
}

function stop(){
	localStream.getTracks().forEach( (track) => {
		track.stop();
	});

}

function muteIncoming(e){
	usrStatus.speaker=!usrStatus.speaker
e.setAttribute("src",usrStatus.speaker? "/static/img/sound.svg" : "/static/img/noSound.svg");
}

function joinChannel(e){
sessionStorage.setItem("id", usrStatus.id)
sessionStorage.setItem("name", usrStatus.name)
sessionStorage.setItem("channel", usrStatus.channel)
socket.emit("usrInfo",usrStatus);
	e.style.display="none";
}

function getBlock(id){
	return document.getElementById(id);
}
