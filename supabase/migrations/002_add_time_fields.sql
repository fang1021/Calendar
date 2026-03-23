-- events テーブルに時刻カラムを追加
-- Supabase の SQL エディタで実行してください

alter table events add column if not exists start_time time;
alter table events add column if not exists end_time time;
