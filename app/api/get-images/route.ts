import { _Object, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY as string,
    secretAccessKey: process.env.R2_SECRET_KEY as string,
  },
});

const getAllObjects = async () => {
  let allContents: _Object[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: "heal-party",
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    });
    const res = await s3.send(command);
    allContents = [...allContents, ...(res.Contents ?? [])];
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);

  return allContents;
};

export async function GET() {
  const contents = await getAllObjects();

  const images =
    contents.map((obj) => ({
      key: obj.Key!,
      url: `${process.env.R2_PUBLIC_DEV_URL}/${obj.Key}`,
      lastModified: obj.LastModified,
    })) ?? [];

  images.sort(
    (a, b) =>
      new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime(),
  );

  return NextResponse.json({ images });
}
