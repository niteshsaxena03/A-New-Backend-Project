import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { fullName, userName, email, password } = req.body;
  console.log(email);
  
  //validate--not empty
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are compulsory");
  }
  //check if user already exist
  //check for images-->upload to cloudinary
  //create user object-->entry in db
  //remove password and refresh token from response
  //check for user creation and return response
});

export { registerUser };
