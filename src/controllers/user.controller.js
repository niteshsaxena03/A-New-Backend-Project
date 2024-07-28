import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { fullName, userName, email, password } = req.body;
  console.log(email);
  //validate--not empty
  //check if user already exist
  //check for images-->upload to cloudinary
  //create user object-->entry in db
  //remove password and refresh token from response
  //check for user creation and return response
});

export { registerUser };
