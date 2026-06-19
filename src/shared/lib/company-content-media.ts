import { getSupabaseClient } from "@/shared/lib/supabase";

const COMPANY_CONTENT_MEDIA_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_COMPANY_CONTENT_BUCKET?.trim() ||
  "company-content-media";

export async function resolveCompanyContentImageUrl(imagePath: string | null) {
  if (!imagePath) {
    return null;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const normalizedPath = imagePath.replace(/^company-content-media\//, "");

  const { data, error } = await getSupabaseClient()
    .storage
    .from(COMPANY_CONTENT_MEDIA_BUCKET)
    .createSignedUrl(normalizedPath, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}
