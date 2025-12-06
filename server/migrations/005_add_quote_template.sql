-- Add template column to quotes table
ALTER TABLE quotes 
ADD COLUMN template TEXT NOT NULL DEFAULT 'standard';

-- Add check constraint to ensure valid values (optional but good practice)
ALTER TABLE quotes
ADD CONSTRAINT valid_template CHECK (template IN ('standard', 'modern', 'minimal'));
