import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// make sure you set the correct path to your video file
var proc = ffmpeg(
  "rtmp://v.ahsa.care:6604/3/3?AVType=1&jsession=0e2513cfde824ca1b7152ac5c38a8cdc&DevIDNO=013524555247&Channel=0&Stream=1",
  { timeout: 432000 }
)
  // set video bitrate
  .videoBitrate(1024)
  // set h264 preset
  .addOption("preset", "superfast")
  // set target codec
  .videoCodec("libx264")
  // set audio bitrate
  .audioBitrate("128k")
  // set audio codec
  // .audioCodec("libfaac")
  // set number of audio channels
  .audioChannels(2)
  // set hls segments time
  .addOption("-hls_time", 10)
  // include all the segments in the list
  .addOption("-hls_list_size", 0)
  // setup event handlers
  .on("end", function () {
    console.log("file has been converted succesfully");
  })
  .on("error", function (err) {
    console.log("an error happened: " + err.message);
  })
  // save to file
  .save("./your_target.m3u8");
