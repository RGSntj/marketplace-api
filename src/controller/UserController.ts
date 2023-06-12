import { hash } from "bcrypt";
import { Response, Request } from "express";
import { prisma } from "../database/prisma";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, accessName } = req.body;

    const isUserUniqueEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const isAccessName = await prisma.access.findUnique({
      where: {
        name: accessName,
      },
    });

    if (!isAccessName) {
      return res.status(400).json({
        message: "Este nivel de acesso não existe !",
      });
    }

    if (isUserUniqueEmail) {
      return res.status(400).json({
        message: "Já existe um usuário com este e-mail !",
      });
    }

    const hashedPassword = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userAccess: {
          create: {
            Access: {
              connect: {
                name: accessName,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
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

    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        userAccess: {
          select: {
            Access: {
              select: {
                name: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!users) {
      return res.status(204);
    }

    return res.json(users);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
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
        message: "Usuário não encontrado !",
      });
    }

    return res.json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
};
