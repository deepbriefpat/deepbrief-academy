-- Add guest registration fields to guest_pass_sessions table
ALTER TABLE `guest_pass_sessions` 
ADD COLUMN `guest_name` varchar(255) DEFAULT NULL,
ADD COLUMN `guest_email` varchar(320) DEFAULT NULL,
ADD COLUMN `guest_company` varchar(255) DEFAULT NULL,
ADD COLUMN `guest_role` varchar(255) DEFAULT NULL,
ADD COLUMN `has_registered` boolean NOT NULL DEFAULT false;

-- Create index for finding registered guests
CREATE INDEX `idx_guest_pass_sessions_registered` ON `guest_pass_sessions` (`has_registered`);
