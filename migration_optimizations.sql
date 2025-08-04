create or replace function public.get_user_dashboard_data(p_user_id uuid)
returns json
language plpgsql
as $$
declare
    profile_data json;
    today_skill_data json;
    weekly_progress_data json;
    category_counts_data json;
    cumulative_growth_data json;
begin
    -- Get profile data
    select
        json_build_object(
            'name', p.name,
            'category', p.category,
            'streakCount', p.streak_count
        )
    into
        profile_data
    from
        public.profiles p
    where
        p.id = p_user_id;

    -- Get today's skill
    select
        json_build_object(
            'date', sh.date,
            'skillId', sh.skill_id,
            'completed', sh.completed
        )
    into
        today_skill_data
    from
        public.skill_history sh
    where
        sh.user_id = p_user_id and sh.date = current_date;

    -- Get weekly progress (last 7 days)
    select
        json_agg(
            json_build_object(
                'date', to_char(d.date, 'YYYY-MM-DD'),
                'completed', coalesce(s.completed_count, 0)
            )
        )
    into
        weekly_progress_data
    from
        (select generate_series(current_date - interval '6 days', current_date, '1 day')::date as date) d
    left join
        (
            select date, count(*) as completed_count
            from public.skill_history
            where user_id = p_user_id and completed = true and date >= current_date - interval '6 days'
            group by date
        ) s on d.date = s.date;

    -- Get category counts for skill balance chart
    select
        json_build_object(
            'thinker', count(*) filter (where s.category_text = 'thinker'),
            'builder', count(*) filter (where s.category_text = 'builder'),
            'creator', count(*) filter (where s.category_text = 'creator'),
            'connector', count(*) filter (where s.category_text = 'connector')
        )
    into
        category_counts_data
    from
        public.skill_history sh
    join (
        values
            ('skill_010', 'thinker'), ('skill_011', 'thinker'), ('skill_012', 'thinker'),
            ('skill_013', 'thinker'), ('skill_014', 'thinker'), ('skill_015', 'thinker'),
            ('skill_001', 'thinker'), ('skill_003', 'thinker'),
            ('skill_002', 'builder'), ('skill_004', 'builder'), ('skill_005', 'builder'),
            ('skill_006', 'creator'), ('skill_007', 'creator'), ('skill_008', 'creator'),
            ('skill_009', 'creator'),
            ('skill_016', 'connector'), ('skill_017', 'connector'), ('skill_018', 'connector'),
            ('skill_019', 'connector'), ('skill_020', 'connector')
    ) as s(id, category_text) on sh.skill_id = s.id
    where
        sh.user_id = p_user_id and sh.completed = true;

    -- Get cumulative growth data
    select
        json_agg(
            json_build_object(
                'date', to_char(date, 'YYYY-MM-DD'),
                'total', total_skills
            )
        )
    into
        cumulative_growth_data
    from (
        select
            date,
            sum(count(*)) over (order by date) as total_skills
        from
            public.skill_history
        where
            user_id = p_user_id and completed = true
        group by
            date
        order by
            date
    ) as cumulative_data;

    -- Combine all data into a single JSON object
    return json_build_object(
        'profile', profile_data,
        'todaySkill', today_skill_data,
        'weeklyProgress', weekly_progress_data,
        'categoryCounts', category_counts_data,
        'cumulativeGrowth', cumulative_growth_data
    );
end;
$$;

create or replace function public.burn_skill_and_get_new(p_user_id uuid)
returns void
language plpgsql
as $$
declare
    user_category public.category;
    seen_skill_ids text[];
    new_skill_id text;
begin
    -- Delete today's skill
    delete from public.skill_history where user_id = p_user_id and date = current_date;

    -- Get user category
    select category into user_category from public.profiles where id = p_user_id;

    -- Get all seen skill ids (now excluding the one just deleted)
    select array_agg(skill_id) into seen_skill_ids from public.skill_history where user_id = p_user_id;
    if seen_skill_ids is null then
        seen_skill_ids := '{}';
    end if;

    -- Replicate getNewSkill logic
    with all_skills as (
        select * from (
            values
                ('skill_010', 'thinker'), ('skill_011', 'thinker'), ('skill_012', 'thinker'),
                ('skill_013', 'thinker'), ('skill_014', 'thinker'), ('skill_015', 'thinker'),
                ('skill_001', 'thinker'), ('skill_003', 'thinker'),
                ('skill_002', 'builder'), ('skill_004', 'builder'), ('skill_005', 'builder'),
                ('skill_006', 'creator'), ('skill_007', 'creator'), ('skill_008', 'creator'),
                ('skill_009', 'creator'),
                ('skill_016', 'connector'), ('skill_017', 'connector'), ('skill_018', 'connector'),
                ('skill_019', 'connector'), ('skill_020', 'connector')
        ) as s(id, category_text)
    ),
    available_skills as (
        select id from all_skills
        where not (id = any(seen_skill_ids))
        and (user_category is null or category_text::public.category = user_category)
    )
    select id into new_skill_id from available_skills order by random() limit 1;

    -- Insert the new skill
    if new_skill_id is not null then
        insert into public.skill_history (user_id, date, skill_id, completed)
        values (p_user_id, current_date, new_skill_id, false);
    else
        insert into public.skill_history (user_id, date, skill_id, completed)
        values (p_user_id, current_date, 'NO_SKILLS_LEFT', true);
    end if;
end;
$$;
