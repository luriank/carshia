export type ProductListItem = {
  id: string;
  slug: string;
  title: string;
  brandName: string;
  thumbnail: string;
  hoverImage?: string;
  price: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
};
