import { Request, Response } from "express";
import { prisma } from "../database/prisma";

import { Product } from "@prisma/client";

export const createSale = async (req: Request, res: Response) => {
  const { products, userSallerId } = req.body;
  const { id } = req.user;

  try {
    const productsByDatabase = await prisma.product.findMany({
      where: {
        id: { in: products.map((product: Product) => product.id) },
      },
    });

    const productWithQuantity = productsByDatabase.map((product) => {
      const { id, name, price } = product;
      const quantity = products.find(
        (p: Product) => p.id === product.id
      ).quantity;
      return {
        id,
        name,
        price,
        quantity,
      };
    });

    let total = 0;

    for (const product of productWithQuantity) {
      total += product.price * parseInt(product.quantity);
    }

    if (id === userSallerId) {
      return res.status(400).json({
        message:
          "Não é possível criar uma venda com ID de comprador e vendeder iguais",
      });
    }

    const sale = await prisma.sale.create({
      data: {
        total_value: total,
        Seller: {
          connect: {
            id: userSallerId,
          },
        },
        Buyer: { connect: { id } },
        SaleProduct: {
          create: productWithQuantity.map((product) => ({
            Product: {
              connect: {
                id: product.id,
              },
            },
            quantity: product.quantity,
          })),
        },
      },
      include: {
        SaleProduct: true,
      },
    });

    productWithQuantity.map(async (product) => {
      await prisma.product.updateMany({
        where: {
          id: product.id,
        },
        data: {
          amount: {
            decrement: parseInt(product.quantity),
          },
        },
      });
    });

    return res
      .status(201)
      .json({ sale, message: "Compra realizada com sucesso." });
  } catch (error) {
    return res.status(400).json({
      error,
    });
  }
};

export const getAllSales = async (req: Request, res: Response) => {
  try {
    const sales = await prisma.sale.findMany({
      select: {
        id: true,
        total_value: true,
        Seller: {
          select: {
            id: true,
            name: true,
          },
        },
        Buyer: {
          select: {
            id: true,
            name: true,
          },
        },
        SaleProduct: {
          select: {
            Product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            quantity: true,
          },
        },
        created_at: true,
      },
    });

    return res.status(200).json(sales);
  } catch (error) {
    return res.status(400).json({
      error,
    });
  }
};
