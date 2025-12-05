-- Migration: Add tax and terms fields for PDF generation
-- Created: 2025-12-04

-- Add tax and terms fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS terms_conditions TEXT;

-- Add tax, terms, and expiration fields to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS terms_conditions TEXT,
ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.tax_rate IS 'Default tax rate percentage for quotes (e.g., 16.00 for 16%)';
COMMENT ON COLUMN profiles.terms_conditions IS 'Default terms and conditions text for quotes';
COMMENT ON COLUMN quotes.tax_rate IS 'Tax rate percentage for this specific quote';
COMMENT ON COLUMN quotes.terms_conditions IS 'Terms and conditions for this specific quote';
COMMENT ON COLUMN quotes.expiration_date IS 'Date when this quote expires';
