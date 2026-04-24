import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse, type NextRequest } from "next/server";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY as string,
    secretAccessKey: process.env.R2_SECRET_KEY as string,
  },
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const imageFileData = formData.get("file") as File;

  if (!imageFileData.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "not supported file type" },
      { status: 400 },
    );
  }

  const imageFileDataArrayBuffer = await imageFileData.arrayBuffer();
  const imageFileDataBuffer = Buffer.from(imageFileDataArrayBuffer);
  // console.log({
  //   imageFileDataArrayBuffer: imageFileDataArrayBuffer,
  //   imageFileDataBuffer,
  // });

  const key = `${new Date().getTime()}_${imageFileData.name}`;

  const command = new PutObjectCommand({
    Bucket: "heal-party",
    Key: key,
    ContentType: imageFileData.type,
    Body: imageFileDataBuffer,
  });

  await s3.send(command);
  const uploadedUrl = `${process.env.R2_PUBLIC_DEV_URL}/${key}`;
  return NextResponse.json({
    url: uploadedUrl,
  });
}
