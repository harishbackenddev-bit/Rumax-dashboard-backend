import { Request, Response } from "express"
import { errorResponseHandler } from "../../lib/errors/error-response-handler"
import { usersModel } from "../../models/user/user-schema"
import bcrypt from "bcryptjs"
import { generatePasswordResetToken, generatePasswordResetTokenByPhone, getPasswordResetTokenByToken } from "../../utils/mails/token"
import { sendPasswordResetEmail } from "../../utils/mails/mail"
import { generatePasswordResetTokenByPhoneWithTwilio } from "../../utils/sms/sms"
import { httpStatusCode } from "../../lib/constant"
import { customAlphabet } from "nanoid"
import jwt, { JwtPayload } from 'jsonwebtoken';
import { adminModel } from "src/models/admin/admin-schema";


export const signupService = async (payload: any, res: Response) => {
  const email = payload.email.toLowerCase().trim();

  const emailExists = await usersModel.findOne({
    email,
  });

  if (emailExists) {
    return errorResponseHandler(
      "Email already exists",
      httpStatusCode.BAD_REQUEST,
      res
    );
  }

  
  payload.email = email;
  payload.password = bcrypt.hashSync(email, 10);

  const identifier = customAlphabet("0123456789", 3);
  payload.identifier = identifier();

  const user = await new usersModel(payload).save();

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  return {
    success: true,
    message: "User signup successful",
    token,
    user,
  };
};

export const userdataServive = async (payload: any, res: Response) => {
  const userId = payload.userId;

  let user = await usersModel.findById(userId);

  if (!user) {
    user = await adminModel.findById(userId);
  }

  if (!user) {
    return errorResponseHandler(
      "User not found",
      httpStatusCode.NOT_FOUND,
      res
    );
  }

  return {
    success: true,
    message: "User data fetched successfully",
    data: user,
  };
};

export const loginService = async (payload: any, res: Response) => {
  const { email, password } = payload;

  const normalizedEmail = email.toLowerCase().trim();

  let account: any = await usersModel
    .findOne({ email: normalizedEmail })
    .select("+password");

  let role = "user";

  if (!account) {
    account = await adminModel
      .findOne({ email: normalizedEmail })
      .select("+password");

    role = "admin";
  }

  if (!account) {
    return errorResponseHandler(
      "User not found",
      httpStatusCode.NOT_FOUND,
      res
    );
  }

  const isPasswordValid = bcrypt.compareSync(
    password,
    account.password
  );

  if (!isPasswordValid) {
    return errorResponseHandler(
      "Invalid password",
      httpStatusCode.UNAUTHORIZED,
      res
    );
  }

  const accountObject: any = account.toObject();
  delete accountObject.password;

  const token = jwt.sign(
    {
      id: account._id,
      email: account.email,
      role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  return {
    success: true,
    message: "Login successful",
    data: {
      ...accountObject,
      role,
    },
    token,
  };
};

export const forgotPasswordService = async (
  payload: any,
  res: Response
) => {
  const { email } = payload;
  console.log("emaildd", email);

  const user = await usersModel.findOne({
    email: email.toLowerCase().trim()
  });

  if (!user) {
    return errorResponseHandler(
      "User not found",
      httpStatusCode.NOT_FOUND,
      res
    );
  }

  const resetToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendPasswordResetEmail(email, resetLink);

  return {
    success: true,
    message: "Password reset link sent successfully"
  };
};



export const verifyPasswordResetService = async (payload: any, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = payload;

    
    if (!token || !newPassword) {
      return errorResponseHandler(
        "Token and new password are required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (newPassword !== confirmPassword) {
      return errorResponseHandler(
        "Passwords do not match",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (newPassword.length < 8) {
      return errorResponseHandler(
        "Password must be at least 8 characters",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return errorResponseHandler(
          "Reset link has expired. Please request a new one.",
          httpStatusCode.BAD_REQUEST,
          res
        );
      }
      return errorResponseHandler(
        "Invalid reset link. Please request a new one.",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    
    const user = await usersModel.findById(decoded.id);
    if (!user) {
      return errorResponseHandler(
        "User not found",
        httpStatusCode.NOT_FOUND,
        res
      );
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    await user.save();

    return {
      success: true,
      message: "Password reset successful. Please login with your new password.",
    };

  } catch (error: any) {
    console.error("Reset password error:", error);
    return errorResponseHandler(
      error.message || "Failed to reset password",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};



export const getUserInfoService = async (id: string, res: Response) => {
  
  

  

  
  
  
  
  
  
  
  
}
















export const updateAUserService = async (payload: any, res: Response) => {
  const userId = payload.userId;
  const body = payload.body;
  
  
  const user = await usersModel.findById(userId);
  if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
  const updateduser = await usersModel.findByIdAndUpdate(userId, { ...body }, { new: true });
  return {
    success: true,
    message: "User data retrieved successfully",
    data: updateduser
  };
};

export const twoFactorAuthService = async (payload: any, res: Response) => {
  const userId = payload.userId;
  const body = payload.body;
  
  
  const user = await usersModel.findById(userId);
  if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
  const updateduser = await usersModel.findByIdAndUpdate(userId, { ...body }, { new: true });
  return {
    success: true,
    message: "User data retrieved successfully",
    data: updateduser
  };
};




export const updateAPasswordService = async (payload: any, res: Response) => {
  const userId = payload.userId;
  const { currentPassword, newPassword } = payload.body;

  const user = await usersModel.findById(userId).select("+password");


  if (!user) { return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res); }

  
  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordMatched) {
    return errorResponseHandler(
      "Current password is incorrect",
      httpStatusCode.BAD_REQUEST,
      res
    );
  }

  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  
  await usersModel.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword,
    },
    {
      new: true,
    }
  );

  return {
    success: true,
    message: "Password updated successfully",
  };
};

export const deleteAUserService = async (id: string, res: Response) => {
  
  

  
  

  
  

  
  
  
  
  
  
  
  
}



export const getDashboardStatsService = async (payload: any, res: Response) => {
  
  const userId = payload.currentUser

  

  

  

  


  
  
  
  
  
  
  
  
  

  return userId;
}