import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const streamer = (video) => {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);

  ffmpeg(
    // "rtmp://v.rcj.care:6604/3/3?AVType=1&jsession=D83434746F98A4C1D796E372D0B8EA31&DevIDNO=363434&Channel=1&Stream=1",
    video,
    { timeout: 432000 }
  )
    .addOptions([
      "-profile:v baseline",
      "-level 3.0",
      "-start_number 0",
      "-hls_list_size 0",
      "-f hls",
    ])
    .output("streams/output.m3u8")
    .on("end", () => {
      console.log("end");
    })
    .run();
};
