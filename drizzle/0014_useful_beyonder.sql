CREATE TABLE `coaching_demo_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fingerprint` varchar(255) NOT NULL,
	`ip_address` varchar(45),
	`interaction_count` int NOT NULL DEFAULT 0,
	`messages` text,
	`converted_to_subscription` boolean DEFAULT false,
	`user_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`last_interaction_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_demo_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coaching_demo_sessions` ADD CONSTRAINT `coaching_demo_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;