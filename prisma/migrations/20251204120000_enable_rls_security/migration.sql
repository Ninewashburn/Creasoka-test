-- Enable RLS
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;

-- Create policies (Deny Public Access)
CREATE POLICY "Deny Public Access" ON "Order" FOR ALL USING (false);
CREATE POLICY "Deny Public Access" ON "OrderItem" FOR ALL USING (false);
CREATE POLICY "Deny Public Access" ON "PasswordResetToken" FOR ALL USING (false);

-- Add policies for existing RLS tables that were missing them
CREATE POLICY "Deny Public Access" ON "Creation" FOR ALL USING (false);
CREATE POLICY "Deny Public Access" ON "User" FOR ALL USING (false);
