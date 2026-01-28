CREATE TABLE `guest_pass_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guest_pass_id` int NOT NULL,
	`fingerprint` varchar(255) NOT NULL,
	`messages` text,
	`message_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`last_interaction_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guest_pass_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guest_passes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`label` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp,
	`usage_count` int NOT NULL DEFAULT 0,
	`last_used_at` timestamp,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guest_passes_id` PRIMARY KEY(`id`),
	CONSTRAINT `guest_passes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `guest_pass_sessions` ADD CONSTRAINT `guest_pass_sessions_guest_pass_id_guest_passes_id_fk` FOREIGN KEY (`guest_pass_id`) REFERENCES `guest_passes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guest_passes` ADD CONSTRAINT `guest_passes_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;