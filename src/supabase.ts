import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  "https://wrpnxyyfiomhnkhzfozp.supabase.co",
  "sb_publishable_MLS7dd9KbVYrk6YpXklSWA_OTnDqzPj",
);
export type Product = {
  id: string;
  name: string;
  brand: string | null;
  platform: string;
  acquisition_type: string;
  received_at: string | null;
  deadline_at: string | null;
  target_videos: number;
  image_url: string | null;
  notes: string | null;
};
export type Video = {
  id: string;
  product_id: string | null;
  posted_at: string | null;
  platform: string;
  caption: string | null;
  url: string | null;
  hook_id: string | null;
};
export type Hook = {
  id: string;
  product_id: string | null;
  hook_text: string;
  status: string;
};
export type Metrics = {
  id: string;
  product_id: string;
  captured_at: string;
  total_views: number;
  total_units_sold: number;
  total_gmv: number;
  total_commission: number;
};
export type Checkin = {
  id: string;
  day: string;
  yoga_done: boolean;
  briefing_read: boolean;
  morning_routine_done: boolean;
  tiktok_videos_count: number;
  shopee_videos_count: number;
  notes: string | null;
};
export function failure(error: unknown): string {
  return error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "Não foi possível salvar. Tente novamente.";
}
