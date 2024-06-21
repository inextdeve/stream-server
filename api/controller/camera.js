import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import findRemoveSync from "find-remove";
import { db } from "../db/config/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const stream = async (req, res) => {
  const { id, analytic } = req.params;

  //Camera properties
  let address = "";
  let name = "";

  // Check if the stream already exist
  if (
    fs.existsSync(
      `${__dirname.split("api")[0]}streams/${id}/${analytic}/output.m3u8`
    )
  ) {
    return res.render(`${__dirname.split("api")[0]}views/video.ejs`, {
      src: `http://localhost:${process.env.PORT}/streams/${id}/${analytic}/output.m3u8`,
    });
  }

  try {
    const dbQuery = `SELECT address, name FROM cameras WHERE id=${id}`;
    const data = await db.query(dbQuery);

    if (data.length < 1) {
      throw new Error("Camera not exist");
    }

    address = data[0].address;
    name = data[0].name;
  } catch (error) {
    return res.render(`${__dirname.split("api")[0]}views/error.ejs`, {
      error: "Camera not found",
      cameraName: "Cannot Connect",
    });
  }

  // check if directory exists and create them
  if (!fs.existsSync(`${__dirname.split("api")[0]}streams/${id}`))
    fs.mkdirSync(`${__dirname.split("api")[0]}streams/${id}`);

  if (!fs.existsSync(`${__dirname.split("api")[0]}streams/${id}/${analytic}`))
    fs.mkdirSync(`${__dirname.split("api")[0]}streams/${id}/${analytic}`);

  //Create ffmpeg Command
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);

  var command = ffmpeg(address, { timeout: 432000 })
    // set video bitrate
    .videoBitrate(1024)
    // set h264 preset
    // .addOption("preset", "superfast")
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
    .output(`${__dirname.split("api")[0]}streams/${id}/${analytic}/output.m3u8`)
    .on("error", (error) => {
      console.log("Error", error.message);
      res.render(`${__dirname.split("api")[0]}views/error.ejs`, {
        error: "Unexpected Error",
        cameraName: "Cannot Connect",
      });
    })
    .once("codecData", () => {
      console.log("codec start");
      //Set interval for removing .ts file older than 30s
      setInterval(() => {
        findRemoveSync(
          `${__dirname.split("api")[0]}streams/${id}/${analytic}`,
          { age: { seconds: 60 }, extensions: ".ts" }
        );
      }, 60000);
      return res.render(`${__dirname.split("api")[0]}views/video.ejs`, {
        src: `http://localhost:${process.env.PORT}/streams/${id}/${analytic}/output.m3u8`,
      });
    })
    .on("start", () => {
      findRemoveSync(`${__dirname.split("api")[0]}streams/${id}/${analytic}`, {
        extensions: [".ts", ".m3u8"],
      });
      console.log("FFMPEG Start");
    })
    .on("end", () => {
      console.log("end");
      findRemoveSync(`${__dirname.split("api")[0]}streams/${id}/${analytic}`, {
        extensions: [".ts", ".m3u8"],
      });
    });

  // setTimeout(function () {
  //   command.on("error", function () {
  //     console.log("Ffmpeg has been killed");
  //   });

  //   command.kill();
  // }, 15000);
  command.run();
};

export { stream };
