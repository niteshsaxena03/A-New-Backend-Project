import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

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
  const existingUser = User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }
  //check for images
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is mandatory");
  }

  //upload to cloudinary
  //create user object-->entry in db
  //remove password and refresh token from response
  //check for user creation and return response
});

export { registerUser };
