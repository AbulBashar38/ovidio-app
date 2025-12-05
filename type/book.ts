export interface BookSubmitRequest {
    pdfUrl: string;
    originalFilename: string;
    backgroundAudio: boolean;
}

export interface BookSubmitResponse {
    message: string;
    bookId?: string;
    // Add other fields if known
}
