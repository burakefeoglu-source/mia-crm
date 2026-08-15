export type TaskStatus = "todo" | "in_progress" | "revision" | "done";
export type ShootType = "video" | "photo";
export type TeamRole = "video" | "edit" | "design" | "social" | "brand_management";
export type ClientSector = "fnb" | "hotel" | "jewelry" | "other";
export type CampaignStatus = "planning" | "active" | "completed";

export interface Client {
  id: string;
  name: string;
  sector: ClientSector;
  is_active: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  email: string;
  created_at: string;
}

export interface Task {
  id: string;
  client_id: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  task_date: string;
  start_time: string;
  duration_minutes: number;
  status: TaskStatus;
  created_at: string;
}

export interface Shoot {
  id: string;
  shoot_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  shoot_type: ShootType;
  notes: string | null;
  created_at: string;
}

export interface LinkedFile {
  id: string;
  entity_type: "task" | "shoot";
  entity_id: string;
  google_file_id: string;
  file_name: string;
  file_url: string;
  mime_type: string | null;
  added_by: string | null;
  created_at: string;
}

export interface Influencer {
  id: string;
  name: string;
  nickname: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  last_budget: number | null;
  notes: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  client_id: string | null;
  title: string;
  campaign_date: string | null;
  status: CampaignStatus;
  created_at: string;
}

// Supabase generated-type placeholder.
// `supabase gen types typescript` çalıştırıldığında bu dosyanın yerini alacak.
export type Database = any;
