export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  progress: number; // 0-100
  status: "converting" | "completed" | "failed";
  duration?: string;
  uploadDate: string;
}

export const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    progress: 45,
    status: "converting",
    uploadDate: "2025-11-26",
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    progress: 100,
    status: "completed",
    duration: "11h 24m",
    uploadDate: "2025-11-25",
  },
  {
    id: "3",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    progress: 100,
    status: "completed",
    duration: "14h 12m",
    uploadDate: "2025-11-24",
  },
  {
    id: "4",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    progress: 100,
    status: "completed",
    duration: "12h 05m",
    uploadDate: "2025-11-20",
  },
  {
    id: "5",
    title: "Dune",
    author: "Frank Herbert",
    progress: 100,
    status: "completed",
    duration: "21h 02m",
    uploadDate: "2025-11-15",
  },
];
