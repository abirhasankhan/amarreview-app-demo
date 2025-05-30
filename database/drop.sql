-- Disable constraints temporarily (optional but useful in some databases)
-- ALTER TABLE ONLY your_table_name DISABLE TRIGGER ALL;

-- Truncate all tables with CASCADE to avoid foreign key issues
TRUNCATE TABLE
  user_badges,
  badges,
  business_faqs,
  business_claims,
  review_reports,
  review_helpful_votes,
  review_responses,
  review_photos,
  reviews,
  business_photos,
  business_hours,
  businesses
CASCADE;

-- Enable constraints again if you disabled them earlier
-- ALTER TABLE ONLY your_table_name ENABLE TRIGGER ALL;
