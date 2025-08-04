-- This migration script fixes the Row Level Security (RLS) policies
-- for the skill_history table. The previous policies were too restrictive,
-- causing 403 Forbidden errors when users tried to update their progress.

-- By applying this migration, users will be able to select, insert, and
-- update their own skill history records, which is required for the
-- app to function correctly.

-- Step 1: Policies for the `skill_history` table

-- Ensure RLS is enabled on the table
alter table public.skill_history enable row level security;

-- Drop existing policies (if any) to start fresh.
-- Note: Supabase might have created a default "manage all" policy.
-- We drop it to replace it with more specific ones.
drop policy if exists "Users can manage their own skill history." on public.skill_history;
drop policy if exists "Users can view their own skill history." on public.skill_history;
drop policy if exists "Users can insert their own skill history." on public.skill_history;
drop policy if exists "Users can update their own skill history." on public.skill_history;

-- Create a policy for SELECT
-- This allows a user to read rows from skill_history if the user_id matches their own.
create policy "Users can view their own skill history."
on public.skill_history for select
using (auth.uid() = user_id);

-- Create a policy for INSERT
-- This allows a user to insert a new row into skill_history if the user_id in the new row matches their own.
create policy "Users can insert their own skill history."
on public.skill_history for insert
with check (auth.uid() = user_id);

-- Create a policy for UPDATE
-- This allows a user to update an existing row if the user_id of that row matches their own.
create policy "Users can update their own skill history."
on public.skill_history for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
