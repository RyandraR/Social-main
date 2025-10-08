// ================= USER =================
export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

// ================= AUTHOR =================
export type Author = {
  id: number;
  name: string;
};

// ================= CATEGORY =================
export type Category = {
  id: number;
  name: string;
};

// ================= BOOK =================
export type Book = {
  id: number;
  title: string;
  description?: string | null;
  isbn?: string | null;
  publishedYear?: number | null;
  coverImage?: string | null;
  rating: number; // default 0 kalau BE nggak kasih
  reviewCount: number;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  authorId: number;
  categoryId: number;
  createdAt?: string;
  updatedAt?: string;
  author: Author; // ✅ nested object dari BE
  category: Category; // ✅ nested object dari BE
};

// ================= LOAN =================
export type Loan = {
  id: number;
  book: Book;
  status: 'BORROWED' | 'RETURNED';
  dueAt: string;
  createdAt: string;
};

// ================= REVIEW =================
export type Review = {
  id: number;
  bookId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
};
