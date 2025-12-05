export type JobStatus =
    | "PENDING"
    | "QUEUED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";
export type JobStep =
    | "UPLOAD_RECEIVED"
    | "VALIDATING"
    | "DOWNLOADING_PDF"
    | "EXTRACTING_TEXT"
    | "CLEANING_TEXT"
    | "GENERATING_AUDIO"
    | "MIXING_AUDIO"
    | "UPLOADING_ASSETS"
    | "FINALIZING"
    | "COMPLETED"
    | "ERROR";
export interface JobEvent {
    id: string;
    jobId: string;
    step: JobStep;
    status: JobStatus;
    message: string;
    progress: number;
    metadata: Record<string, any>;
    createdAt: string;
}
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

export interface BookJob {
    id: string;
    userId: string;
    sourcePdfUrl: string;
    originalFilename: string;
    totalCharacters: number;
    estimatedDuration: number | null;
    status: JobStatus; // e.g. "FAILED", "COMPLETED", "PROCESSING"
    currentStep: JobStep;
    errorMessage: string | null;
    backgroundTrack: string | null;
    createdAt: string;
    updatedAt: string;
    audioFile: any | null;
}

export interface GetBooksResponse {
    jobs: BookJob[];
}
export interface GetBookProgressResponse {
    status: JobStatus;
    currentStep: JobStep;
    events: JobEvent[];
}