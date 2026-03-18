-- ============================================================
-- カレンダーアプリ 初期マイグレーション
-- Supabase の SQL エディタで実行してください
-- ============================================================

-- events テーブル
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  date date not null,
  end_date date,
  memo text,
  color text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- updated_at 自動更新トリガー関数
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- トリガー設定
drop trigger if exists events_updated_at on events;
create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at();

-- Row Level Security 有効化
alter table events enable row level security;

-- RLS ポリシー: SELECT は全員（閲覧者も）許可
create policy "events_select_all"
  on events for select
  using (true);

-- RLS ポリシー: INSERT は認証済みユーザーが自分のデータのみ
create policy "events_insert_own"
  on events for insert
  with check (auth.uid() = user_id);

-- RLS ポリシー: UPDATE は認証済みユーザーが自分のデータのみ
create policy "events_update_own"
  on events for update
  using (auth.uid() = user_id);

-- RLS ポリシー: DELETE は認証済みユーザーが自分のデータのみ
create policy "events_delete_own"
  on events for delete
  using (auth.uid() = user_id);
