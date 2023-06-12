import { Request, Response } from "express";
import { prisma } from "../database/prisma";

export const createStore = async (req: Request, res: Response) => {
  const { name } = req.body;
  const { id } = req.user;

  const isUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!isUser) {
    return res.status(400).json({
      message: "Usuário não existe.",
    });
  }

  const store = await prisma.store.create({
    data: {
      name,
      User: {
        connect: {
          id,
        },
      },
    },
  });

  return res.status(201).json(store);
};

export const getAllStores = async (req: Request, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        User: {
          select: {
            name: true,
          },
        },
        Product: {
          select: {
            id: true,
            name: true,
            price: true,
            amount: true,
          },
        },
      },
    });

    if (!stores) {
      return res.status(204).send();
    }

    return res.json(stores);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { storeId } = req.params;
    const { id } = req.user;

    const isStore = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!isStore) {
      return res.status(400).json({
        message: "Loja não encontrada.",
      });
    }

    if (id !== isStore.userId) {
      return res.status(400).json({
        message: "Esta loja não pertence a esse usuário",
      });
    }

    const updatedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        name,
      },
    });

    return res.status(200).json(updatedStore);
  } catch (error) {
    return res.status(500).json({ error });
  }
};
