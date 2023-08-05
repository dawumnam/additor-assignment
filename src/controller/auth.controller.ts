import express, { Request, Response } from "express";
import { UserService } from "../service/user.service";
import { UserRepositoryImpl } from "../repository/user.repository";
import jwt from "jsonwebtoken";
import { RegisterDto } from "./interface/dto";

const SECRET_KEY = "secret"; // should not use in production :O

const userService = new UserService(UserRepositoryImpl.getInstance());

const authRouter = express.Router();

authRouter.post("/register", async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const registerDto = RegisterDto.of(email, name);
  if (!email || !name) {
    return res.status(400).json({ error: "Missing fields." });
  }
  await userService.createUser(registerDto);
  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
  return res.status(200).json({ token });
});

export default authRouter;
