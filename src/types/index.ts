export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface Profile {
  id: string;
  username?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}
