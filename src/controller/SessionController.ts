import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        userAccess: {
          select: {
            Access: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Usuário não encontrado",
      });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Senha incorreta.",
      });
    }
    const SECRET_KEY = process.env.MY_SECRET_KEY;

    if (!SECRET_KEY) {
      throw new Error("Chave secreta não fornecida");
    }

    const token = sign(
      {
        userId: user.id,
        roles: user.userAccess.map((role) => role.Access?.name),
      },
      SECRET_KEY,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    return res.status(200).json({ token, user });
  } catch (error) {
    return res.status(400).json(error);
  }
};
