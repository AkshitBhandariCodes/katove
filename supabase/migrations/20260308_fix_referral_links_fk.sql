-- Fix: Add Foreign Key constraint on referral_links.product_id -> products.id
-- This is required for the Supabase PostgREST join in the dashboard endpoint
-- to resolve `product:products(id, name, slug)` on the referral_links table.

ALTER TABLE referral_links
  DROP CONSTRAINT IF EXISTS referral_links_product_id_fkey;

ALTER TABLE referral_links
  ADD CONSTRAINT referral_links_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id)
  ON DELETE SET NULL;

-- Create the increment_referral_click RPC if it doesn't exist
CREATE OR REPLACE FUNCTION increment_referral_click(link_uuid UUID, aff_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE referral_links SET clicks = clicks + 1 WHERE id = link_uuid;
  UPDATE affiliates SET total_clicks = total_clicks + 1 WHERE id = aff_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the increment_affiliate_stats RPC if it doesn't exist
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

-- Ensure the hero-deployments storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-deployments', 'hero-deployments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload to hero-deployments bucket
DROP POLICY IF EXISTS "Authenticated users can upload hero images" ON storage.objects;
CREATE POLICY "Authenticated users can upload hero images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'hero-deployments');

-- Allow public read access to hero-deployments bucket
DROP POLICY IF EXISTS "Public read access for hero images" ON storage.objects;
CREATE POLICY "Public read access for hero images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'hero-deployments');

-- Allow authenticated users to delete hero images
DROP POLICY IF EXISTS "Authenticated users can delete hero images" ON storage.objects;
CREATE POLICY "Authenticated users can delete hero images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'hero-deployments');
