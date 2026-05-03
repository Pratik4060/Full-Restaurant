import { cloudinary } from "../config/cloudinary.js";

export const uploadImageBuffer = async (
  buffer: Buffer,
  folder: string,
  filename: string,
) =>
  new Promise<{ secureUrl: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: filename,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Image upload failed"));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
