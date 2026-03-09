-- Affiliate System Upgrade Migration
-- Adds per-link conversion tracking and improves the schema

-- Add referral_link_id to referral_conversions for per-link attribution
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referral_conversions' AND column_name = 'referral_link_id'
  ) THEN
    ALTER TABLE referral_conversions ADD COLUMN referral_link_id UUID REFERENCES referral_links(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add product_id to referral_conversions for per-product earnings tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referral_conversions' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE referral_conversions ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add created_at to referral_clicks if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referral_clicks' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE referral_clicks ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Ensure default commission rate settings exist
INSERT INTO site_settings (key, value, type)
VALUES 
  ('commission_rate_content_creator', '10', 'number'),
  ('commission_rate_sales_manager', '8', 'number')
ON CONFLICT (key) DO NOTHING;

-- Update increment_referral_click to also increment conversions count on link
CREATE OR REPLACE FUNCTION increment_referral_click(link_uuid UUID, aff_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE referral_links SET clicks = clicks + 1 WHERE id = link_uuid;
  UPDATE affiliates SET total_clicks = total_clicks + 1 WHERE id = aff_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update increment_affiliate_stats to also increment conversions on the link
CREATE OR REPLACE FUNCTION increment_affiliate_stats(aff_id UUID, sale_amount NUMERIC, comm_amount NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE affiliates
  SET
    total_sales = total_sales + 1,
    total_revenue = total_revenue + sale_amount,
    total_commission = total_commission + comm_amount,
    updated_at = NOW()
  WHERE id = aff_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment link conversions count
CREATE OR REPLACE FUNCTION increment_link_conversion(link_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE referral_links SET conversions = conversions + 1 WHERE id = link_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
