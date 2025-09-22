-- Update user roles based on email patterns
-- This script updates existing users to have proper roles

-- Update users with 'owner' in their email to owner role
UPDATE users SET role = 'owner' WHERE email LIKE '%owner%';

-- Update users with 'admin' in their email to admin role  
UPDATE users SET role = 'admin' WHERE email LIKE '%admin%';

-- Show all users with their updated roles
SELECT id, email, firstName, lastName, role, createdAt FROM users;
