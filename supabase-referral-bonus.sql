-- SQL rapid pou bay 7 pwen nan parennage ak 5 pwen pou nouvo kliyan an
-- Kouri sa nan Supabase SQL Editor

-- 1) Trigger otomatik: le yon nouvo kliyan enskri ak referred_by, bay 7 pwen nan parennage a
CREATE OR REPLACE FUNCTION award_referral_bonus()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL AND NEW.referred_by <> NEW.id THEN
    UPDATE customers
    SET points = COALESCE(points, 0) + 7,
        history = COALESCE(history, '[]'::jsonb) || jsonb_build_array(
          jsonb_build_object(
            'desc', 'Bonus parrainage (' || COALESCE(NEW.referral_source, NEW.referral_code, 'REF') || ')',
            'pts', 7,
            'date', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
          )
        )
    WHERE id = NEW.referred_by;

    UPDATE customers
    SET points = COALESCE(points, 0) + 5,
        history = COALESCE(history, '[]'::jsonb) || jsonb_build_array(
          jsonb_build_object(
            'desc', 'Bonus de bienvenue via parrainage (+5 pts)',
            'pts', 5,
            'date', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
          )
        )
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_award_referral_bonus ON customers;
CREATE TRIGGER trg_award_referral_bonus
AFTER INSERT ON customers
FOR EACH ROW
EXECUTE FUNCTION award_referral_bonus();

-- 2) Si ou vle eseye menuellement pou yon kliyan ki deja egziste:
-- Chanje 123 ak id parennage a (moun ki pataje) epi 456 ak id nouvo kliyan an.
-- Sa pral bay 7 pwen nan parennage a epi 5 pwen pou nouvo kliyan an.
UPDATE customers
SET points = COALESCE(points, 0) + 7,
    history = COALESCE(history, '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object(
        'desc', 'Bonus parrainage (TEST)',
        'pts', 7,
        'date', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
      )
    )
WHERE id = 123;

UPDATE customers
SET points = COALESCE(points, 0) + 5,
    history = COALESCE(history, '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object(
        'desc', 'Bonus de bienvenue via parrainage (+5 pts)',
        'pts', 5,
        'date', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
      )
    )
WHERE id = 456;

-- 3) Query pou verifye
SELECT id, name, phone, points, history
FROM customers
WHERE id IN (123, 456)
ORDER BY id;
