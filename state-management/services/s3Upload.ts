import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Buffer } from "buffer";

// Validate AWS credentials
function validateAwsCredentials() {
    const accessKeyId = process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY;
    const region = process.env.EXPO_PUBLIC_AWS_REGION;
    const bucketName = process.env.EXPO_PUBLIC_AWS_S3_BUCKET_NAME;

    const missing = [];
    if (!accessKeyId) missing.push("EXPO_PUBLIC_AWS_ACCESS_KEY_ID");
    if (!secretAccessKey) missing.push("EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY");
    if (!region) missing.push("EXPO_PUBLIC_AWS_REGION");
    if (!bucketName) missing.push("EXPO_PUBLIC_AWS_S3_BUCKET_NAME");

    if (missing.length > 0) {
        throw new Error(
            `Missing AWS credentials: ${missing.join(
                ", "
            )}. Please check your .env file.`
        );
    }

    return { accessKeyId, secretAccessKey, region, bucketName };
}

// Initialize S3 client
function getS3Client() {
    const { accessKeyId, secretAccessKey, region } = validateAwsCredentials();

    return new S3Client({
        region,
        credentials: {
            accessKeyId: accessKeyId!,
            secretAccessKey: secretAccessKey!,
        },
    });
}

export interface UploadToS3Params {
    file: {
        uri: string;
        name: string;
        mimeType?: string;
    };
    onProgress?: (progress: number) => void;
}

export interface UploadToS3Result {
    success: boolean;
    fileUrl?: string;
    key?: string;
    error?: string;
}

/**
 * Upload a file to AWS S3
 * @param params - Upload parameters including file and optional progress callback
 * @returns Promise with upload result
 */
export async function uploadToS3({
    file,
    onProgress,
}: UploadToS3Params): Promise<UploadToS3Result> {
    try {
        // Validate credentials before attempting upload
        const { bucketName, region } = validateAwsCredentials();

        // Generate unique file key
        const timestamp = Date.now();
        const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const key = `uploads/${timestamp}-${fileName}`;

        // Read file as ArrayBuffer using fetch (standard React Native approach for local files)
        const response = await fetch(file.uri);
        const blob = await response.blob();

        // In React Native with Hermes, we can use Blob directly or convert to Buffer if SDK demands node Buffer
        // AWS SDK v3 usually accepts Blob, but sometimes converting to ArrayBuffer -> Buffer is safer for RN polyfills
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });

        const buffer = Buffer.from(arrayBuffer);

        // Get S3 client
        const s3Client = getS3Client();

        // Create upload command
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: file.mimeType || "application/pdf",
            // Optional: Add metadata
            Metadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString(),
            },
        });

        // Simulate progress (S3 SDK doesn't provide native progress for PutObjectCommand in this context easily)
        if (onProgress) {
            onProgress(10); // Start processing
        }

        // Upload to S3
        await s3Client.send(command);

        if (onProgress) {
            onProgress(100); // Complete
        }

        // Construct file URL using virtual-hosted-style URL
        const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

        return {
            success: true,
            fileUrl,
            key,
        };
    } catch (error) {
        console.error("S3 upload error:", error);

        // Provide helpful error messages
        let errorMessage = "Upload failed";
        if (error instanceof Error) {
            errorMessage = error.message;

            // Check for common errors
            if (errorMessage.includes("Missing AWS credentials")) {
                errorMessage =
                    "AWS credentials not configured. Please check your .env file.";
            } else if (errorMessage.includes("Access Key")) {
                errorMessage =
                    "Invalid AWS credentials. Please verify your Access Key ID and Secret Access Key.";
            } else if (errorMessage.includes("NetworkingError") || errorMessage.includes("Network Error")) {
                errorMessage =
                    "Network error. Check your internet connection.";
            } else if (errorMessage.includes("NoSuchBucket")) {
                errorMessage = "S3 bucket not found. Verify bucket name and region.";
            } else if (errorMessage.includes("AccessDenied")) {
                errorMessage = "Access denied. Check IAM permissions for s3:PutObject.";
            }
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}
