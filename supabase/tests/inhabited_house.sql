begin;
select set_config('test.owner',gen_random_uuid()::text,true),set_config('test.other',gen_random_uuid()::text,true);
insert into auth.users(id) values(current_setting('test.owner')::uuid),(current_setting('test.other')::uuid);
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
insert into public.journal_entries(user_id,entry_date,content,mood) values(auth.uid(),current_date,'transient verification','Em paz');
insert into public.house_records(user_id,kind,title,content) values(auth.uid(),'remember','transient verification','test');
insert into public.house_state(user_id,fireplace_on) values(auth.uid(),true);
update public.journal_entries set content='saved' where user_id=auth.uid();
update public.house_records set opened_at=now(),read_at=now(),completed_at=now() where user_id=auth.uid();
do $$begin
 if not exists(select 1 from public.journal_entries where user_id=auth.uid() and content='saved') then raise exception 'own update failed'; end if;
 if not exists(select 1 from public.house_state where user_id=auth.uid() and fireplace_on) then raise exception 'state failed'; end if;
 begin
 update public.journal_entries set user_id=current_setting('test.other')::uuid where user_id=auth.uid();
 raise exception 'ownership transfer allowed';
 exception when insufficient_privilege then null; end;
end$$;
select set_config('request.jwt.claim.sub',current_setting('test.other'),true);
do $$begin
 if exists(select 1 from public.journal_entries where user_id=current_setting('test.owner')::uuid) or exists(select 1 from public.house_records where user_id=current_setting('test.owner')::uuid) or exists(select 1 from public.house_state where user_id=current_setting('test.owner')::uuid) then raise exception 'cross-user leak'; end if;
 begin insert into public.journal_entries(user_id,entry_date) values(current_setting('test.owner')::uuid,current_date+1); raise exception 'cross-user insert allowed'; exception when insufficient_privilege then null; end;
 delete from public.house_records where user_id=current_setting('test.owner')::uuid;
 if found then raise exception 'cross-user delete allowed'; end if;
 update public.house_state set fireplace_on=false where user_id=current_setting('test.owner')::uuid;
 if found then raise exception 'cross-user update allowed'; end if;
end$$;
reset role;
rollback;
select 'PASS: own CRUD, timestamps, state and cross-user select/insert/update/delete isolation; all temporary data rolled back' as result;
