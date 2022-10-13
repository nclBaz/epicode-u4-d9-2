import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const bookSchema = {
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string!",
    },
  },
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },
  /*   email: {
    in: ["body"],
    isEmail: {
      errorMessage: "Email is a mandatory field and needs to be a valid email!",
    },
  }, */
}

// VALIDATION MIDDLEWARES CHAIN 1. checkBooksSchema --> 2. checkValidationResult

export const checkBooksSchema = checkSchema(bookSchema) // The checkSchema function gives us back a middleware that checks req.bodies

export const checkValidationResult = (req, res, next) => {
  // 1. Check if previous middleware (checkBooksSchema) has found any error
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // 2.1 If we have validation errors --> trigger error handler (400)
    next(
      createHttpError(400, "Validation errors in request body!", {
        errorsList: errors.array(),
      })
    )
  } else {
    // 2.2 Else (no errors) --> normal flow (next)
    next()
  }
}
