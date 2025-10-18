-- --------------------------------------------------------
-- BULK RANDOM TRANSACTION GENERATOR
-- Purpose: Generate ~500 realistic transactions across all accounts
-- --------------------------------------------------------

DO $$
DECLARE
  acc RECORD;
  i INT;
  txn_id UUID;
  txn_type TEXT;
  txn_amt NUMERIC(15,2);
  txn_desc TEXT;
  txn_date TIMESTAMP;
  recipient_name TEXT;
  user_id UUID;
  status TEXT;
  direction TEXT;
  start_date TIMESTAMP := '2025-08-01';
  end_date   TIMESTAMP := '2025-09-30';
  account_list UUID[];
BEGIN
  -- Collect all account IDs
  account_list := ARRAY(SELECT id FROM accounts);

  FOR i IN 1..500 LOOP
    -- Pick a random account
    acc := (SELECT * FROM accounts ORDER BY random() LIMIT 1);
    user_id := acc.user_id;

    -- Random date within the last two months
    txn_date := start_date + (random() * (end_date - start_date));

    -- Choose type
    txn_type := (ARRAY['deposit','withdrawal','payment','transfer'])[1 + (random()*3)::INT];

    -- Randomize amount
    txn_amt := round(((random() * 2000.00) + 10.00)::numeric, 2);
    IF txn_type IN ('withdrawal', 'payment', 'transfer') THEN
      txn_amt := txn_amt * -1;
    END IF;

    -- Generate description and recipients
    CASE txn_type
      WHEN 'deposit' THEN txn_desc := 'Auto deposit (simulation)';
      WHEN 'withdrawal' THEN txn_desc := 'ATM withdrawal (simulation)';
      WHEN 'payment' THEN txn_desc := 'Payment to merchant (simulation)';
      WHEN 'transfer' THEN txn_desc := 'Transfer between accounts (simulation)';
    END CASE;

    recipient_name := (ARRAY['Employer','Supermarket','Electric Co','Water Co','Friend','Landlord'])[1 + (random()*5)::INT];
    status := (ARRAY['completed','pending','failed'])[1 + (random()*2)::INT];

    -- Insert transaction
    INSERT INTO transactions (id, type, amount, description, date, status, from_account_id, to_account_id, recipient_name, user_id, created_at)
    VALUES (
      gen_random_uuid(),
      txn_type,
      txn_amt,
      txn_desc,
      txn_date,
      status,
      -- Randomly assign from/to IDs:
      CASE WHEN txn_type IN ('withdrawal','payment','transfer') THEN acc.id ELSE NULL END,
      CASE WHEN txn_type IN ('deposit','transfer') THEN (SELECT id FROM accounts WHERE id <> acc.id ORDER BY random() LIMIT 1) ELSE NULL END,
      recipient_name,
      user_id,
      now()
    );
  END LOOP;
END$$;