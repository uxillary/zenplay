create table public.support_payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid,
  provider text not null default 'stripe' check (provider = 'stripe'),
  offer_id text not null check (offer_id in ('support_2_gbp', 'support_5_gbp', 'support_10_gbp')),
  amount_minor integer not null check (amount_minor > 0),
  currency text not null check (currency = 'GBP'),
  status text not null default 'initiated'
    check (status in ('initiated', 'paid', 'partially_refunded', 'refunded', 'disputed', 'dispute_lost', 'failed', 'cancelled')),
  pre_dispute_status text check (pre_dispute_status is null or pre_dispute_status in ('paid', 'partially_refunded', 'refunded')),
  checkout_session_id text unique,
  payment_intent_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint support_payment_offer_amount check (
    (offer_id = 'support_2_gbp' and amount_minor = 200)
    or (offer_id = 'support_5_gbp' and amount_minor = 500)
    or (offer_id = 'support_10_gbp' and amount_minor = 1000)
  )
);

comment on table public.support_payments is
  'Server-maintained current payment projection. Source facts are retained in support_payment_events.';
comment on column public.support_payments.account_id is
  'Authenticated account UUID captured at checkout; deliberately has no auth.users FK pending retention/severing decision.';

create table public.support_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'stripe'),
  provider_event_id text not null,
  provider_event_type text not null,
  provider_object_id text,
  payment_id uuid references public.support_payments(id) on delete set null,
  account_id uuid,
  event_type text not null check (event_type in (
    'payment_initiated', 'payment_succeeded', 'payment_failed', 'payment_cancelled',
    'refund_partial', 'refund_full', 'dispute_opened', 'dispute_won', 'dispute_lost'
  )),
  amount_minor integer check (amount_minor is null or amount_minor >= 0),
  currency text check (currency is null or currency = 'GBP'),
  occurred_at timestamptz not null,
  ingested_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

comment on table public.support_payment_events is
  'Minimal normalized verified provider event facts; raw provider payloads and billing/card data are not retained.';

alter table public.support_payments enable row level security;
alter table public.support_payment_events enable row level security;
revoke all on table public.support_payments from public, anon, authenticated;
revoke all on table public.support_payment_events from public, anon, authenticated;
grant all on table public.support_payments to service_role;
grant all on table public.support_payment_events to service_role;

create function public.reject_support_payment_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'support payment events are immutable' using errcode = '42501';
end;
$$;
revoke all on function public.reject_support_payment_event_mutation() from public, anon, authenticated;

create trigger support_payment_events_are_immutable
  before update or delete on public.support_payment_events
  for each row execute function public.reject_support_payment_event_mutation();

create function public.record_verified_support_payment_event(
  p_provider_event_id text,
  p_provider_event_type text,
  p_provider_object_id text,
  p_payment_id uuid,
  p_account_id uuid,
  p_event_type text,
  p_amount_minor integer,
  p_currency text,
  p_occurred_at timestamptz,
  p_payment_intent_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
  payment_account_id uuid;
begin
  if p_payment_id is not null then
    select account_id into payment_account_id
      from public.support_payments where id = p_payment_id for update;
    if not found or payment_account_id is distinct from p_account_id then
      raise exception 'payment/account association mismatch' using errcode = '23514';
    end if;
  end if;

  insert into public.support_payment_events (
    provider, provider_event_id, provider_event_type, provider_object_id,
    payment_id, account_id, event_type, amount_minor, currency, occurred_at
  ) values (
    'stripe', p_provider_event_id, p_provider_event_type, p_provider_object_id,
    p_payment_id, p_account_id, p_event_type, p_amount_minor, p_currency, p_occurred_at
  ) on conflict (provider, provider_event_id) do nothing;

  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  if p_payment_id is not null then
    update public.support_payments
      set status = case p_event_type
        when 'payment_succeeded' then case
          when status in ('partially_refunded', 'refunded', 'disputed', 'dispute_lost') then status
          else 'paid' end
        when 'payment_failed' then case when status = 'initiated' then 'failed' else status end
        when 'payment_cancelled' then case when status = 'initiated' then 'cancelled' else status end
        when 'refund_partial' then case when status = 'refunded' then 'refunded' else 'partially_refunded' end
        when 'refund_full' then 'refunded'
        when 'dispute_opened' then case when status = 'disputed' then status else 'disputed' end
        when 'dispute_won' then case when status = 'disputed' then coalesce(pre_dispute_status, 'paid') else status end
        when 'dispute_lost' then case when status = 'disputed' then 'dispute_lost' else status end
        else status
      end,
      pre_dispute_status = case
        when p_event_type = 'dispute_opened' and status in ('paid', 'partially_refunded', 'refunded') then status
        when p_event_type in ('dispute_won', 'dispute_lost') then null
        else pre_dispute_status
      end,
      payment_intent_id = coalesce(payment_intent_id, p_payment_intent_id),
      paid_at = case when p_event_type = 'payment_succeeded' then coalesce(paid_at, p_occurred_at) else paid_at end,
      updated_at = now()
      where id = p_payment_id;
  end if;
  return true;
end;
$$;

revoke all on function public.record_verified_support_payment_event(text, text, text, uuid, uuid, text, integer, text, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.record_verified_support_payment_event(text, text, text, uuid, uuid, text, integer, text, timestamptz, text)
  to service_role;
