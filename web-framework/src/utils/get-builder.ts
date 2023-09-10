import { Builder } from "../enums";

export function getBuilder() {
  const v = process.env.VERCEL_DEPLOYMENT_ID;

  if (typeof v === "string" && v.length > 3) {
    return Builder.VERCEL;
  }

  return Builder.NODE;
}
