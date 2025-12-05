import { api } from "@/state-management/apiConfig";
import { ENDPOINTS } from "@/state-management/endpoint";
import { BookSubmitRequest, BookSubmitResponse } from "@/type/book";

const booksApi = api.injectEndpoints({
    endpoints: (builder) => ({
        submitBook: builder.mutation<BookSubmitResponse, BookSubmitRequest>({
            query: (data) => ({
                url: ENDPOINTS.book_submit,
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const { useSubmitBookMutation } = booksApi;
