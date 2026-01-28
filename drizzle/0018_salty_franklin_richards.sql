CREATE TABLE `behavioral_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`guest_pass_code` varchar(64),
	`insight_type` enum('avoidance','over_indexing','pressure_response','decision_pattern','blind_spot') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`evidence` text NOT NULL,
	`confidence` int NOT NULL,
	`surfaced_at` timestamp,
	`acknowledged_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `behavioral_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_contexts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`guest_pass_code` varchar(64),
	`key_themes` text NOT NULL,
	`avoidance_patterns` text,
	`pressure_responses` text,
	`decision_patterns` text,
	`last_updated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_contexts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coaching_commitments` MODIFY COLUMN `coaching_user_id` int;--> statement-breakpoint
ALTER TABLE `coaching_commitments` MODIFY COLUMN `status` enum('pending','in_progress','completed','missed','open','closed','overdue','abandoned') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `user_id` int;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `guest_pass_code` varchar(64);--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `context` text;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `closed_at` timestamp;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `closed_note` text;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `follow_up_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `last_follow_up_at` timestamp;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `behavioral_insights` ADD CONSTRAINT `behavioral_insights_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_contexts` ADD CONSTRAINT `session_contexts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD CONSTRAINT `coaching_commitments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;