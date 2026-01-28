CREATE TABLE `accountability_partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`partner_email` varchar(320) NOT NULL,
	`partner_name` varchar(255),
	`status` enum('pending','accepted','declined','revoked') NOT NULL DEFAULT 'pending',
	`invitation_token` varchar(64) NOT NULL,
	`permissions` text,
	`accepted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountability_partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountability_partners_invitation_token_unique` UNIQUE(`invitation_token`)
);
--> statement-breakpoint
ALTER TABLE `accountability_partners` ADD CONSTRAINT `accountability_partners_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;