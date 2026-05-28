-- ==================================================
--  SOLUTION SQL POUR SYNCHRONISATION DES POINTS
--  KikTop Fresco - Supabase
-- ==================================================
-- Kouri sa nan Supabase SQL Editor
-- Sa pral asire ke points yo toujou aktyalize nan baz done a

ALTER TABLE IF EXISTS customers
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

-- ==================================================
--  1. FUNCTION POUR METTRE A JOUR LES POINTS D'UN CLIENT
-- ==================================================
CREATE OR REPLACE FUNCTION update_customer_points(
    p_customer_id BIGINT,
    p_points_earned INTEGER DEFAULT 0,
    p_points_used INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    UPDATE customers
    SET 
        points = points + p_points_earned - p_points_used,
        updated_at = NOW()
    WHERE id = p_customer_id;
    
    -- Ajouter a l'historique si necessaire
    IF p_points_earned > 0 OR p_points_used > 0 THEN
        UPDATE customers
        SET history = COALESCE(history, '[]'::jsonb) || 
            jsonb_build_array(
                jsonb_build_object(
                    'desc', CASE 
                        WHEN p_points_used > 0 THEN 'Points utilises'
                        ELSE 'Points gagnes'
                    END,
                    'pts', p_points_earned - p_points_used,
                    'date', NOW()::text
                )
            ),
            updated_at = NOW()
        WHERE id = p_customer_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
--  2. FUNCTION POUR CALCULER LES POINTS D'UNE COMMANDE
-- ==================================================
CREATE OR REPLACE FUNCTION calculate_order_points(p_total_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_points_rate INTEGER;
    v_points INTEGER;
BEGIN
    -- Recuperer le taux de points depuis settings
    SELECT points_rate INTO v_points_rate
    FROM settings
    WHERE id = 1;
    
    -- Si pas de taux, utiliser 150 par defaut
    IF v_points_rate IS NULL OR v_points_rate = 0 THEN
        v_points_rate := 150;
    END IF;
    
    -- Calculer les points
    v_points := FLOOR(p_total_amount / v_points_rate);
    
    RETURN v_points;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
--  3. TRIGGER POUR METTRE A JOUR LES POINTS APRES COMMANDE
-- ==================================================
CREATE OR REPLACE FUNCTION update_points_after_order()
RETURNS TRIGGER AS $$
DECLARE
    v_points_to_add INTEGER;
    v_max_points INTEGER;
BEGIN
    -- Si c'est une nouvelle commande
    IF TG_OP = 'INSERT' THEN
        -- Calculer les points gagnes
        v_points_to_add := calculate_order_points(NEW.total);
        
        -- Recuperer le max points
        SELECT max_points INTO v_max_points
        FROM settings
        WHERE id = 1;
        
        IF v_max_points IS NULL OR v_max_points = 0 THEN
            v_max_points := 100;
        END IF;
        
        -- Mettre a jour les points du client
        IF NEW.customer_id IS NOT NULL THEN
            UPDATE customers
            SET 
                points = LEAST(points + v_points_to_add, v_max_points),
                orders_count = orders_count + 1,
                total_spent = total_spent + NEW.total,
                history = COALESCE(history, '[]'::jsonb) || 
                    jsonb_build_array(
                        jsonb_build_object(
                            'desc', 'Commande #' || NEW.id,
                            'pts', v_points_to_add,
                            'date', NOW()::text
                        )
                    ),
                updated_at = NOW()
            WHERE id = NEW.customer_id;
            
            -- Mettre a jour la commande avec les points
            NEW.points_earned := v_points_to_add;
            NEW.points_used := COALESCE(NEW.points_used, 0);
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
--  4. CREER LE TRIGGER SUR LA TABLE ORDERS
-- ==================================================
DROP TRIGGER IF EXISTS trigger_update_points_after_order ON orders;
CREATE TRIGGER trigger_update_points_after_order
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_points_after_order();

-- ==================================================
--  5. FUNCTION POUR UTILISER LES POINTS (COMMANDE GRATUITE)
-- ==================================================
CREATE OR REPLACE FUNCTION use_customer_points(p_customer_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_points INTEGER;
    v_max_points INTEGER;
BEGIN
    -- Recuperer les points actuels
    SELECT points INTO v_current_points
    FROM customers
    WHERE id = p_customer_id;
    
    -- Recuperer le max points
    SELECT max_points INTO v_max_points
    FROM settings
    WHERE id = 1;
    
    IF v_max_points IS NULL OR v_max_points = 0 THEN
        v_max_points := 100;
    END IF;
    
    -- Verifier si le client a assez de points
    IF v_current_points >= v_max_points THEN
        -- Deduire les points
        UPDATE customers
        SET 
            points = points - v_max_points,
            history = COALESCE(history, '[]'::jsonb) || 
                jsonb_build_array(
                    jsonb_build_object(
                        'desc', 'Commande gratuite',
                        'pts', -v_max_points,
                        'date', NOW()::text
                    )
                ),
            updated_at = NOW()
        WHERE id = p_customer_id;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
--  6. FUNCTION POUR RECHARGER LES POINTS D'UN CLIENT
-- ==================================================
CREATE OR REPLACE FUNCTION get_customer_points(p_identifier TEXT)
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    email TEXT,
    phone TEXT,
    points INTEGER,
    orders_count INTEGER,
    total_spent INTEGER,
    history JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.points,
        c.orders_count,
        c.total_spent,
        c.history
    FROM customers c
    WHERE c.email = p_identifier OR c.phone = p_identifier;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
--  7. FUNCTION POUR SYNCHRONISER LES POINTS (SI BESOIN)
-- ==================================================
CREATE OR REPLACE FUNCTION sync_customer_points(p_customer_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
    v_total_points INTEGER;
    v_max_points INTEGER;
BEGIN
    -- Recuperer le max points
    SELECT max_points INTO v_max_points
    FROM settings
    WHERE id = 1;
    
    IF v_max_points IS NULL OR v_max_points = 0 THEN
        v_max_points := 100;
    END IF;
    
    -- Calculer les points depuis toutes les commandes
    SELECT COALESCE(SUM(points_earned), 0) - COALESCE(SUM(points_used), 0)
    INTO v_total_points
    FROM orders
    WHERE customer_id = p_customer_id;
    
    -- Mettre a jour le client
    UPDATE customers
    SET 
        points = LEAST(v_total_points, v_max_points),
        updated_at = NOW()
    WHERE id = p_customer_id;
    
    RETURN v_total_points;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
--  8. FUNCTION POUR EFASE TOUTES LES COMMANDES
-- ==================================================
CREATE OR REPLACE FUNCTION clear_all_orders()
RETURNS VOID AS $$
BEGIN
    DELETE FROM orders;

    UPDATE customers
    SET 
        orders_count = 0,
        total_spent = 0,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ==================================================
--  9. FUNCTION POUR RETIRER DES POINTS DES COMPTES
-- ==================================================
CREATE OR REPLACE FUNCTION deduct_points_from_accounts(p_points_to_remove INTEGER DEFAULT 100)
RETURNS INTEGER AS $$
DECLARE
    v_updated_rows INTEGER;
BEGIN
    UPDATE customers
    SET 
        points = GREATEST(points - p_points_to_remove, 0),
        history = COALESCE(history, '[]'::jsonb) || 
            jsonb_build_array(
                jsonb_build_object(
                    'desc', 'Retrait automatique de points',
                    'pts', -p_points_to_remove,
                    'date', NOW()::text
                )
            ),
        updated_at = NOW()
    WHERE points > p_points_to_remove;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    RETURN v_updated_rows;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
--  10. FUNCTION POUR RESETTER UN COMPTE CLIENT
-- ==================================================
CREATE OR REPLACE FUNCTION reset_customer_account(p_customer_id BIGINT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM orders
    WHERE customer_id = p_customer_id;

    UPDATE customers
    SET 
        points = 0,
        orders_count = 0,
        total_spent = 0,
        history = '[]'::jsonb,
        updated_at = NOW()
    WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
--  11. INDEX POUR AMELIORER LES PERFORMANCES
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_customers_points ON customers(points DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_points ON orders(customer_id, points_earned);

-- ==================================================
--  NOTES IMPORTANTES
-- ==================================================
-- 1. Kouri sa nan Supabase SQL Editor
-- 2. Apre sa, points yo pral mete ajou otomatikman nan baz done a
-- 3. JavaScript la jis bezwen rechfe done yo soti nan Supabase
-- 4. Sa pral asire ke points yo toujou konsistant atravè aparèy yo
-- 5. Si ou vle teste, kouri: SELECT sync_customer_points(customer_id);
