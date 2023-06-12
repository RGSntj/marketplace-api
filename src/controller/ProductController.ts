import { Request, Response } from "express";
import { prisma } from "../database/prisma";

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, amount } = req.body;
  const { storeId } = req.params;

  const product = await prisma.product.create({
    data: {
      name,
      price,
      amount,
      Store: {
        connect: {
          id: storeId,
        },
      },
    },
  });

  return res.status(201).json(product);
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();

    if (!products) {
      return res.status(204).json({
        message: "Não há nenhum produto registrado !",
      });
    }

    return res.json(products);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { name, price, amount } = req.body;
  const { productId } = req.params;
  const { id } = req.user;

  const isProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      Store: true,
    },
  });

  if (id !== isProduct?.Store?.userId) {
    return res.status(400).json({
      message: "Este produto não pertence a esse usuário!",
    });
  }

  if (!isProduct) {
    return res.status(400).json({
      message: `Produto com o id ${productId} não existe`,
    });
  }

  const product = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      name,
      price,
      amount,
    },
  });

  return res.status(201).json(product);
};
