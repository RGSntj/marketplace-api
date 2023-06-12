import { Router } from "express";

// users controllers
import {
  createUser,
  getAllUsers,
  getUserById,
} from "./controller/UserController";

// accesses controllers
import { createAccess, getAllAccess } from "./controller/AccessController";

// stores controllers
import {
  createStore,
  getAllStores,
  updateStore,
} from "./controller/StoreController";

// products controllers
import {
  createProduct,
  getAllProducts,
  updateProduct,
} from "./controller/ProductController";

// sessions controllers
import { signIn } from "./controller/SessionController";

// sales controllers
import { createSale, getAllSales } from "./controller/SaleController";

// middlwares
import { AuthMiddlware } from "./middleware/AuthMiddleware";

export const router = Router();

// user routes
router.post("/user", createUser);
router.get("/user", AuthMiddlware(["adm"]), getAllUsers);
router.get("/user/:id", AuthMiddlware(["adm", "Vendedor"]), getUserById);

// session routes
router.post("/login", signIn);

// access routes
router.post("/create-access", AuthMiddlware(["adm"]), createAccess);
router.get("/access", AuthMiddlware(["adm"]), getAllAccess);

// store routes
router.post("/create-store", AuthMiddlware(["adm", "Vendedor"]), createStore);
router.get("/store", getAllStores);
router.put(
  "/update-store/:storeId",
  AuthMiddlware(["adm", "Vendedor"]),
  updateStore
);

// product routes
router.post(
  "/product/:storeId",
  AuthMiddlware(["adm", "Vendedor"]),
  createProduct
);
router.get("/product", getAllProducts);
router.put(
  "/update-product/:productId",
  AuthMiddlware(["adm", "Vendedor"]),
  updateProduct
);

// sale routes
router.post(
  "/sale",
  AuthMiddlware(["adm", "Vendedor", "Comprador"]),
  createSale
);

router.get("/sales", AuthMiddlware(["adm", "Vendedor"]), getAllSales);
