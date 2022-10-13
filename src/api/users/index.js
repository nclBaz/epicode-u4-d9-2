// ******************************************** USERS RELATED ENDPOINTS *****************************

// *********************************************** USERS CRUD ***************************************

/*

1. CREATE --> POST http://localhost:3001/users/ (+ body)
2. READ --> GET http://localhost:3001/users/
3. READ (single user) --> GET http://localhost:3001/users/:userId
4. UPDATE (single user) --> PUT http://localhost:3001/users/:userId (+ body)
5. DELETE (single user) --> DELETE http://localhost:3001/users/:userId

*/
import express from "express" // 3RD PARTY MODULE
import fs from "fs" // CORE MODULE (package that doesn't need to be installed)
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid" // 3RD PARTY MODULE

// ************************************** HOW TO GET users.json PATH ******************************

// Target --> D:\Epicode\2022\BE-MASTER-02\U4\epicode-u4-d2-2\src\api\users\users.json

// 1. Let's start from the current's file path --> D:\Epicode\2022\BE-MASTER-02\U4\epicode-u4-d2-2\src\api\users\index.js
// console.log("IMPORT META URL --> ", import.meta.url)
// console.log("PATH --> ", fileURLToPath(import.meta.url))

// 2. We can obtain the parent's folder path --> D:\Epicode\2022\BE-MASTER-02\U4\epicode-u4-d2-2\src\api\users
// console.log("DIRNAME --> ", dirname(fileURLToPath(import.meta.url)))

// 3. We can concatenate users folder path with "users.json" --> D:\Epicode\2022\BE-MASTER-02\U4\epicode-u4-d2-2\src\api\users\users.json
const usersJSONPath = join(
  // PLEASE DO NOT USE "+" TO CONCATENATE TWO PATHS TOGETHER. USE JOIN INSTEAD BECAUSE IT IS GOING TO TAKE CARE OF WHICH OS YOU ARE USING!!!!
  dirname(fileURLToPath(import.meta.url)),
  "users.json"
)

// ************************************************************************************************

const usersRouter = express.Router()

// 1. CREATE --> POST http://localhost:3001/users/ (+ body)
usersRouter.post("/", (request, response) => {
  // 1. Read the request body to obtain new user's data
  console.log("REQUEST BODY: ", request.body) // Remember to add express.json() into the main server configuration!

  // 2. Add some server generated info (unique id, createdAt, ...)
  const newUser = { ...request.body, createdAt: new Date(), id: uniqid() }
  console.log("NEW USER: ", newUser)

  // 3. Read the content of the users.json file, obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath))

  // 4. Push the new user to the array
  usersArray.push(newUser)

  // 5. Write the array back on the file
  fs.writeFileSync(usersJSONPath, JSON.stringify(usersArray)) // We cannot pass an array to writeFile function

  // 6. Send back a proper response
  response.status(201).send({ id: newUser.id })
})

// 2. READ --> GET http://localhost:3001/users/
usersRouter.get("/", (request, response) => {
  // 1. Read the content of users.json file
  const fileContent = fs.readFileSync(usersJSONPath) // this gives us back a BUFFER OBJECT (which is machine language)
  /* console.log("FILE CONTENT: ", fileContent) */

  // 2. Obtain an array from that file
  const users = JSON.parse(fileContent)

  // 3. Send back the array as a response
  response.send(users)
})

// 3. READ (single user) --> GET http://localhost:3001/users/:userId
usersRouter.get("/:userId", (request, response) => {
  // 1. Obtain the user id from the URL
  const userID = request.params.userId

  // 2. Read the users.json file, obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath))

  // 3. Find the specific user by id in the array
  const foundUser = usersArray.find(user => user.id === userID)

  // 4. Send back a proper response

  response.send(foundUser)
})

// 4. UPDATE (single user) --> PUT http://localhost:3001/users/:userId (+ body)
usersRouter.put("/:userId", (request, response) => {
  // 1. Read the file, obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath))

  // 2. Modify the specified user by merging previous properties with new properties coming from req.body

  // 2.1 Find the index in the array of the speficied user
  const index = usersArray.findIndex(user => user.id === request.params.userId)
  const oldUser = usersArray[index]

  // 2.2 Craft a modified user by merging previous properties with new properties coming from req.body
  const updatedUser = { ...oldUser, ...request.body, updatedAt: new Date() }

  // 2.3 Replace that index position with the modified user
  usersArray[index] = updatedUser

  // 3. Save the modified array back on disk
  fs.writeFileSync(usersJSONPath, JSON.stringify(usersArray))

  // 4. Send back a proper response
  response.send(updatedUser)
})

// 5. DELETE (single user) --> DELETE http://localhost:3001/users/:userId
usersRouter.delete("/:userId", (request, response) => {
  // 1. Read the file, obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath))

  // 2. Filter out the specified user from the array, keeping just the array of the remaining users
  const remainingUsers = usersArray.filter(
    user => user.id !== request.params.userId
  )

  // 3. Save the array of remaining users back on disk
  fs.writeFileSync(usersJSONPath, JSON.stringify(remainingUsers))

  // 4. Send back a proper response

  response.status(204).send()
})

export default usersRouter // Please do not forget this!
