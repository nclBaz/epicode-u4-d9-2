import express from "express"
import multer from "multer"
import { extname } from "path"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import {
  getBooks,
  getBooksJSONReadableStream,
  saveUsersAvatars,
} from "../../lib/fs-tools.js"
import { pipeline } from "stream"
import { createGzip } from "zlib"
import { getPDFReadableStream } from "../../lib/pdf-tools.js"

const filesRouter = express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // this is checking for something called CLOUDINARY_URL in your env variables
    params: {
      folder: "fs0322/users",
    },
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("avatar")

filesRouter.post(
  "/:userId/avatar",
  multer().single("avatar"),
  async (req, res, next) => {
    // "avatar" needs to match precisely the name of the field appended in the FormData object coming from the FE.
    // If they don't match, multer is not going to find that file
    try {
      console.log("FILE --> ", req.file)

      // Find the user by userId ("36k8a8w0l8vgogor") in users.json
      // save the file as /public/img/users/36k8a8w0l8vgogor.gif
      // Update that user by adding the path to reach the image, like "avatar": "/public/img/users/36k8a8w0l8vgogor.gif"
      // This is going to give the FE the possibility to display the image later on in an <img src="http://localhost:3001/public/img/users/36k8a8w0l8vgogor.gif" />
      const fileName = req.params.userId + extname(req.file.originalname)
      await saveUsersAvatars(fileName, req.file.buffer)
      res.send({ message: "FILE UPLOADED!" })
    } catch (error) {
      next(error)
    }
  }
)

filesRouter.post(
  "/multiple",
  multer().array("avatars"),
  async (req, res, next) => {
    try {
      console.log("FILE --> ", req.files)
      const arrayOfPromises = req.files.map(file =>
        saveUsersAvatars(file.originalname, file.buffer)
      )
      await Promise.all(arrayOfPromises)
      res.send({ message: "FILES UPLOADED!" })
    } catch (error) {
      next(error)
    }
  }
)

filesRouter.post(
  "/cloudinaryUpload",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      // 1. Cloudinary upload happens automatically thanks to the middleware cloudinaryUploader
      // 2. req.file will contain the url for the uploaded file
      console.log("REQ FILE: ", req.file)
      // 3. use that url to update the db record

      res.send()
    } catch (error) {
      next(error)
    }
  }
)

filesRouter.get("/booksJSON", (req, res, next) => {
  try {
    // SOURCES (file on disk, http request,...) --> DESTINATIONS (file on disk, terminal, http response)

    // SOURCE (Readable Stream on books.json file) --> DESTINATION (http response)

    res.setHeader("Content-Disposition", "attachment; filename=books.json.gz")
    const source = getBooksJSONReadableStream()
    const destination = res
    const transform = createGzip()
    pipeline(source, transform, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})

filesRouter.get("/pdf", async (req, res, next) => {
  try {
    // SOURCE (PDF Readable Stream) --> DESTINATION (http response)

    res.setHeader("Content-Disposition", "attachment; filename=whatever.pdf")
    const books = await getBooks()
    const source = getPDFReadableStream(books[0])
    const destination = res

    pipeline(source, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})

export default filesRouter
