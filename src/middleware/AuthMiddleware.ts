import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { prisma } from "../database/prisma";

interface DecodedToken {
  userId: string;
}

export function AuthMiddlware(permissions?: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token não fornecido ou inválido !",
      });
    }

    const token = authHeader.substring(7);

    try {
      const SECRET_KEY = process.env.MY_SECRET_KEY;

      if (!SECRET_KEY) {
        throw new Error("Chave secreta não fornecida");
      }

      const decodedToken = verify(token, SECRET_KEY) as DecodedToken;

      req.user = { id: decodedToken.userId };

      if (permissions) {
        const user = await prisma.user.findUnique({
          where: {
            id: decodedToken.userId,
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

        const userPermissions =
          user?.userAccess.map((an) => an.Access?.name) ?? [];

        const hasPermissions = permissions.some((p) =>
          userPermissions.includes(p)
        );

        if (!hasPermissions) {
          return res.status(403).json({
            message: "Permissão negada !",
          });
        }
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Token inválido !",
      });
    }
  };
}
