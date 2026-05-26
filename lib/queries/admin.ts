import "server-only";
import { prisma } from "@/lib/prisma";

const ADMIN_PAGE_SIZE = 12;

export async function getAdminProducts(opts: {
  q?: string;
  page?: number;
  showDeleted?: boolean;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const where = {
    ...(opts.showDeleted ? {} : { isDeleted: false }),
    ...(opts.q
      ? { title: { contains: opts.q, mode: "insensitive" as const } }
      : {}),
  };

  const [total, rows, categories, brands] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    products: rows.map((p) => ({
      id: p.id,
      title: p.title,
      titleEn: p.titleEn,
      thumbnail: p.thumbnail,
      price: p.price,
      discountPercentage: p.discountPercentage,
      stockQuantity: p.stockQuantity,
      isDeleted: p.isDeleted,
      isFeatured: p.isFeatured,
      categoryId: p.categoryId,
      brandId: p.brandId,
      categoryName: p.category.name,
      brandName: p.brand.name,
      description: p.description,
      descriptionEn: p.descriptionEn,
      images: p.images,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    brands: brands.map((b) => ({ id: b.id, name: b.name })),
  };
}

export async function getAdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { id: true, quantity: true } },
    },
  });
  return orders.map((o) => ({
    id: o.id,
    total: o.total,
    status: o.status,
    paymentMode: o.paymentMode,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
    customerName: o.user.name,
    customerEmail: o.user.email,
    itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
  }));
}

export type AdminProduct = Awaited<
  ReturnType<typeof getAdminProducts>
>["products"][number];
