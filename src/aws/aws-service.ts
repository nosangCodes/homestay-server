import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import s3Client from "./client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.AWS_BUCKET_NAME as string;

export const s3UploadSingle = async (file: Express.Multer.File) => {
  try {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Key: fileName,
      Bucket: bucketName,
      Body: file.buffer,
    });

    const result = await s3Client.send(command);
    console.log("🚀 ~ s3UploadSingle ~ result:", result);
    return { status: result.$metadata.httpStatusCode, fileName };
  } catch (error) {
    throw error;
  }
};

export const s3UploadMultiple = async (files: Express.Multer.File[]) => {
  try {
    let fileNames: string[] = [];
    const commands = files.map((file) => {
      const currentFileName = `${uuidv4()}-${file.originalname}`;
      fileNames.push(currentFileName);
      return new PutObjectCommand({
        Key: currentFileName,
        Bucket: bucketName,
        Body: file.buffer,
      });
    });
    const results = await Promise.all(
      commands.map((command) => s3Client.send(command))
    );
    return { status: results[0].$metadata.httpStatusCode, fileNames };
  } catch (error) {
    throw error;
  }
};

export const generateImageLinkSingle = async (name: string) => {
  try {
    if (!name) {
      return "";
    }
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: name,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 43200 });
    return {
      name,
      url,
    };
  } catch (error) {
    throw error;
  }
};

export const generateImageLinkMultiple = async (names: string[]) => {
  try {
    const results = await Promise.all(
      names.map((name) => generateImageLinkSingle(name))
    );
    return results;
  } catch (error) {
    throw error;
  }
};

export const s3DeleteObject = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error("[ERROR DELETING S3 BUCKET OBJECT]", error);
  }
};

export const s3DeleteObjectMultiple = async (keys: (string | undefined)[]) => {
  try {
    const responses = await Promise.all(
      keys.map((key) => {
        if (key) {
          s3DeleteObject(key);
        }
      })
    );
    return responses;
  } catch (error) {
    console.error("[ERROR DELETING S3 BUCKET MULTIPLE OBJECT]", error);
  }
};
