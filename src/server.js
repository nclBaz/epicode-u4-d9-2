//const express = require("express") <-- OLD SYNTAX (we don't want to use old stuff)
import express from "express" // NEW SYNTAX (you can use this only if type:"module" is added on package.json)
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import createHttpError from "http-errors"
import { join } from "path"
import usersRouter from "./api/users/index.js"
import booksRouter from "./api/books/index.js"
import filesRouter from "./api/files/index.js"
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3001
const publicFolderPath = join(process.cwd(), "./public")

// *************************************** MIDDLEWARES *************************************

/* ****************************************** CORS *****************************************

CROSS-ORIGIN RESOURCE SHARING

Cross-Origin Requests:

1. FE=http://localhost:3000 BE=http://localhost:3001 <-- 2 different port numbers they represent 2 different origins
2. FE=https://mywonderfulfe.com BE=https://mywonderfulbe.com <-- 2 different domains they represent 2 different origins
3. FE=https://domain.com BE=http://domain.com <-- 2 different protocols they represent 2 different origins

*/

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

server.use(express.static(publicFolderPath))
server.use(
  cors({
    origin: (origin, corsNext) => {
      console.log("CURRENT ORIGIN :", origin)

      if (!origin || whitelist.indexOf(origin) !== -1) {
        // if origin is in the whitelist you can move next
        corsNext(null, true)
      } else {
        // if origin is NOT in the whitelist --> trigger an error
        corsNext(
          createHttpError(
            400,
            `CORS error! your origin ${origin} is not on the list!`
          )
        )
      }
    },
  })
)
server.use(express.json()) // If you don't add this line BEFORE the endpoints, all requests' bodies will be UNDEFINED

// ************************************* ENDPOINTS ******************************************
server.use("/users", usersRouter) // /users will be the prefix that all the endpoints in the usersRouter will have
server.use("/books", booksRouter)
server.use("/files", filesRouter)
// ********************************** ERROR HANDLERS ****************************************

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log(`Server is running on port ${port}`)
})
