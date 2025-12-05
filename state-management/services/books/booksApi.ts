import { api } from "@/state-management/apiConfig";
import { ENDPOINTS } from "@/state-management/endpoint";
import { BookSubmitRequest, BookSubmitResponse, GetBooksResponse } from "@/type/book";

const booksApi = api.enhanceEndpoints({ addTagTypes: ["books"] }).injectEndpoints({
    endpoints: (builder) => ({
        submitBook: builder.mutation<BookSubmitResponse, BookSubmitRequest>({
            query: (data) => ({
                url: ENDPOINTS.book_submit,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["books", 'user'],
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
    }),
});

export const { useSubmitBookMutation, useGetBooksQuery, useGetBookProgressQuery } = booksApi;
