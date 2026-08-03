import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { orderRouter } from "./modules/order/order.routes.js";
import { paymentRouter } from "./modules/payment/payment.routes.js";
import { couponRouter } from "./modules/coupon/coupon.routes.js";
import { reviewRouter } from "./modules/review/review.routes.js";
import { wishlistRouter } from "./modules/wishlist/wishlist.routes.js";
import { recommendationRouter } from "./modules/recommendation/recommendation.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Mount payment router first to allow raw buffer parsing on webhooks
app.use("/api/payments", paymentRouter);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "AISAF API listening");
});

export { app };
