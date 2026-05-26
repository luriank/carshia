import "server-only";
import { prisma } from "@/lib/prisma";

export type AddressSnapshot = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  type: string;
};

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { id: true, thumbnail: true, title: true, quantity: true } },
    },
  });
  return orders.map((o) => ({
    id: o.id,
    total: o.total,
    status: o.status,
    paymentMode: o.paymentMode,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
    itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    items: o.items,
  }));
}

export async function getUserOrder(id: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: { items: true },
  });
  if (!order) return null;
  return {
    id: order.id,
    total: order.total,
    status: order.status,
    paymentMode: order.paymentMode,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    address: order.addressJson as unknown as AddressSnapshot,
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      title: i.title,
      thumbnail: i.thumbnail,
      price: i.price,
      quantity: i.quantity,
    })),
  };
}
