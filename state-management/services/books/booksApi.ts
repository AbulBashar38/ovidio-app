import { api } from "@/state-management/apiConfig";
import { ENDPOINTS } from "@/state-management/endpoint";
import {
  BookAudioResponse,
  BookSubmitRequest,
  BookSubmitResponse,
  GetBookDetailsResponse,
  GetBookProgressResponse,
  GetBooksResponse,
} from "@/type/book";

const booksApi = api
  .enhanceEndpoints({ addTagTypes: ["books"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      submitBook: builder.mutation<BookSubmitResponse, BookSubmitRequest>({
        query: (data) => ({
          url: ENDPOINTS.book_submit,
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["books", "user"],
      }),
      getBooks: builder.query<GetBooksResponse, void>({
        query: () => ({
          url: ENDPOINTS.books,
          method: "GET",
        }),
        providesTags: ["books"],
      }),
      getBookProgress: builder.query<GetBookProgressResponse, string>({
        query: (id) => `${ENDPOINTS.books}/${id}/progress`,
        providesTags: (_result, _error, id) => [{ type: "books", id }],
      }),
      getBookDetails: builder.query<GetBookDetailsResponse, string>({
        query: (id) => `${ENDPOINTS.books}/${id}`,
        providesTags: (_result, _error, id) => [{ type: "books", id }],
      }),
      getBookAudio: builder.query<BookAudioResponse, string>({
        query: (jobId) => `${ENDPOINTS.books}/${jobId}/audio`,
        providesTags: (_result, _error, jobId) => [
          { type: "books", id: jobId },
        ],
      }),
    }),
  });

export const {
  useSubmitBookMutation,
  useGetBooksQuery,
  useGetBookProgressQuery,
  useGetBookDetailsQuery,
  useGetBookAudioQuery,
} = booksApi;
