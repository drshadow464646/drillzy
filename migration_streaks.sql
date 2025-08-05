-- migration_streaks.sql

-- Drop the function if it already exists to ensure a clean slate
drop function if exists public.calculate_streak(user_id_param uuid);

-- Create the function to calculate the streak
create or replace function public.calculate_streak(user_id_param uuid)
returns int
language plpgsql
security definer -- Important for RLS, allows the function to see all history for the calculation
as $$
declare
    streak int := 0;
    current_check_date date := timezone('utc', now())::date;
    is_completed_today boolean;
    is_completed_yesterday boolean;
begin
    -- Check if a skill was completed today for the given user
    select exists(select 1 from public.skill_history where user_id = user_id_param and date = current_check_date and completed = true) into is_completed_today;

    -- Check if a skill was completed yesterday for the given user
    select exists(select 1 from public.skill_history where user_id = user_id_param and date = current_check_date - interval '1 day' and completed = true) into is_completed_yesterday;

    -- If the user hasn't completed a skill today or yesterday, their streak is 0.
    if not is_completed_today and not is_completed_yesterday then
        return 0;
    end if;

    -- If today's skill is not completed, start counting from yesterday.
    if not is_completed_today then
        current_check_date := current_check_date - interval '1 day';
    end if;

    -- Loop backwards from the current date to find consecutive completed days.
    loop
        if exists(select 1 from public.skill_history where user_id = user_id_param and date = current_check_date and completed = true) then
            streak := streak + 1;
            current_check_date := current_check_date - interval '1 day';
        else
            -- Exit the loop when we find a day that is not completed.
            exit;
        end if;
    end loop;

    return streak;
end;
$$;
