DO $$
DECLARE
  acc RECORD;
  i INT;
  txn_type TEXT;
  txn_amt NUMERIC(15,2);
  txn_desc TEXT;
  txn_date TIMESTAMP;
  recipient_name TEXT;
  status TEXT;
  start_date TIMESTAMP := '2025-08-01';
  end_date   TIMESTAMP := '2025-09-30';
  random_to_acc UUID;
BEGIN
  FOR i IN 1..500 LOOP
    -- ✅ Correct way: use SELECT ... INTO
    SELECT * INTO acc FROM accounts ORDER BY random() LIMIT 1;

    -- Random date within range
    txn_date := start_date + (random() * (end_date - start_date));

    -- Choose type
    txn_type := (ARRAY['deposit','withdrawal','payment','transfer'])[1 + (random()*3)::INT];

    -- Randomize amount
    txn_amt := round(((random() * 2000.00) + 10.00)::numeric, 2);
    IF txn_type IN ('withdrawal', 'payment', 'transfer') THEN
      txn_amt := txn_amt * -1;
    END IF;

    -- Description and status
    CASE txn_type
      WHEN 'deposit' THEN txn_desc := 'Auto deposit (simulation)';
      WHEN 'withdrawal' THEN txn_desc := 'ATM withdrawal (simulation)';
      WHEN 'payment' THEN txn_desc := 'Payment to merchant (simulation)';
      WHEN 'transfer' THEN txn_desc := 'Transfer between accounts (simulation)';
    END CASE;

    recipient_name := (ARRAY['Employer','Supermarket','Electric Co','Water Co','Friend','Landlord'])[1 + (random()*5)::INT];
    status := (ARRAY['completed','pending','failed'])[1 + (random()*2)::INT];

    -- Generate random "to_account_id" (text) if applicable
    SELECT id INTO random_to_acc FROM accounts WHERE id <> acc.id ORDER BY random() LIMIT 1;

    -- Insert transaction aligned with VARCHAR fields
    INSERT INTO transactions (
      type,
      amount,
      description,
      date,
      status,
      from_account_id,
      to_account_id,
      recipient_name,
      user_id
    )
    VALUES (
      txn_type,
      txn_amt,
      txn_desc,
      txn_date,
      status,
      CASE WHEN txn_type IN ('withdrawal','payment','transfer') THEN acc.id ELSE NULL END,
      CASE WHEN txn_type IN ('deposit','transfer') THEN random_to_acc::TEXT ELSE NULL END,
      recipient_name,
      acc.user_id::TEXT
    );
  END LOOP;
END$$;