import type { Prisma } from '@prisma/client';

export type Product = Prisma.ProductGetPayload<{}>;
export type ProductCreateInput = Omit<Product, 'id'> & { imageUrl?: string };
