begin;

select plan(19);

insert into auth.users (id, email)
values ('20000000-0000-4000-8000-000000000001', 'ledger-user@example.test');

set local role service_role;
insert into public.support_payments (id, account_id, offer_id, amount_minor, currency)
values ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'support_5_gbp', 500, 'GBP');

select is(
  public.record_verified_support_payment_event(
    'evt_unique_1', 'checkout.session.completed', 'cs_test_1',
    '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
    'payment_succeeded', 500, 'GBP', '2026-10-04T12:00:00Z', 'pi_test_1'
  ), true, 'first verified provider event is recorded'
);
select is(
  public.record_verified_support_payment_event(
    'evt_unique_1', 'checkout.session.completed', 'cs_test_1',
    '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
    'payment_succeeded', 500, 'GBP', '2026-10-04T12:00:00Z', 'pi_test_1'
  ), false, 'duplicate provider event is idempotently ignored'
);
select is((select count(*)::integer from public.support_payment_events), 1, 'retry does not duplicate event history');
select is((select status from public.support_payments where id = '30000000-0000-4000-8000-000000000001'), 'paid', 'projection derives from the verified event');
select public.record_verified_support_payment_event(
  'evt_refund_partial', 'charge.refunded', 'ch_test_1',
  '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
  'refund_partial', 100, 'GBP', '2026-10-04T12:01:00Z', 'pi_test_1'
);
select is((select status from public.support_payments where id = '30000000-0000-4000-8000-000000000001'), 'partially_refunded', 'partial refund updates the projection');
select public.record_verified_support_payment_event(
  'evt_dispute_open', 'charge.dispute.created', 'dp_test_1',
  '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
  'dispute_opened', 500, 'GBP', '2026-10-04T12:02:00Z', 'pi_test_1'
);
select is((select status from public.support_payments where id = '30000000-0000-4000-8000-000000000001'), 'disputed', 'open dispute is represented');
select public.record_verified_support_payment_event(
  'evt_dispute_won', 'charge.dispute.closed', 'dp_test_1',
  '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
  'dispute_won', 500, 'GBP', '2026-10-04T12:03:00Z', 'pi_test_1'
);
select is((select status from public.support_payments where id = '30000000-0000-4000-8000-000000000001'), 'partially_refunded', 'won dispute restores prior refund state');
select public.record_verified_support_payment_event(
  'evt_success_late', 'checkout.session.completed', 'cs_test_1',
  '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
  'payment_succeeded', 500, 'GBP', '2026-10-04T12:04:00Z', 'pi_test_1'
);
select is((select status from public.support_payments where id = '30000000-0000-4000-8000-000000000001'), 'partially_refunded', 'late success does not erase refund facts');
select throws_ok(
  $$update public.support_payment_events set provider_event_type = 'edited'$$,
  '42501', null, 'service role cannot mutate immutable event history'
);
select throws_ok(
  $$select public.record_verified_support_payment_event(
    'evt_wrong_owner', 'charge.refunded', 'ch_test_1',
    '30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000099',
    'refund_partial', 100, 'GBP', '2026-10-04T12:00:00Z', 'pi_test_1'
  )$$,
  '23514', null, 'event account must match the payment account'
);
select throws_ok(
  $$insert into public.support_payments (account_id, offer_id, amount_minor, currency) values
    ('20000000-0000-4000-8000-000000000001', 'support_2_gbp', 500, 'GBP')$$,
  '23514', null, 'offer amount cannot be changed by caller'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select throws_ok($$select * from public.support_payments$$, '42501', null, 'authenticated users cannot read payment ledger');
select throws_ok(
  $$insert into public.support_payments (account_id, offer_id, amount_minor, currency) values
    ('20000000-0000-4000-8000-000000000001', 'support_2_gbp', 200, 'GBP')$$,
  '42501', null, 'authenticated users cannot create payment records'
);
select throws_ok(
  $$insert into public.support_payment_events (provider, provider_event_id, provider_event_type, event_type, occurred_at)
    values ('stripe', 'evt_client', 'charge.refunded', 'refund_full', now())$$,
  '42501', null, 'authenticated users cannot create provider events'
);
select throws_ok(
  $$delete from public.support_payment_events$$,
  '42501', null, 'authenticated users cannot delete financial event history'
);
reset role;

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok($$select * from public.support_payment_events$$, '42501', null, 'anonymous role cannot read provider events');

reset role;
delete from auth.users where id = '20000000-0000-4000-8000-000000000001';
select is((select count(*)::integer from public.support_payments), 1, 'Auth deletion does not cascade-delete payment facts');
select is((select count(*)::integer from public.support_payment_events), 5, 'Auth deletion does not cascade-delete financial events');
select is((select count(*)::integer from public.private_profiles), 0, 'payment migration leaves private profile relation available');
select * from finish();
rollback;
