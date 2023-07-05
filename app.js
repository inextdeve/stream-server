import express from "express";
import hls from "hls-server";
import dotenv from "dotenv";
import cors from "cors";
import * as fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import camera from "./api/routes/camera.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();

//Setting Cors
app.use(cors({ origin: "*", methods: "GET,PUT,POST,DELETE,PATCH" }));

//Setting view engine to ejs
app.set("view engine", "ejs");

app.use("/camera", camera);

const server = app.listen(process.env.PORT);

new hls(server, {
  provider: {
    exists: (req, cb) => {
      const ext = req.url.split(".").pop();

      if (ext !== "m3u8" && ext !== "ts") {
        return cb(null, true);
      }
      const getFile = () => {
        fs.access(__dirname + req.url, fs.constants.F_OK, function (err) {
          if (err) {
            console.log("File not exist");
            return cb(null, false);
          }
          cb(null, true);
        });
      };
      //Get the m3u8
      getFile();
    },
    getManifestStream: (req, cb) => {
      const stream = fs.createReadStream(__dirname + req.url);
      cb(null, stream);
    },
    getSegmentStream: (req, cb) => {
      const stream = fs.createReadStream(__dirname + req.url);
      cb(null, stream);
    },
  },
});
