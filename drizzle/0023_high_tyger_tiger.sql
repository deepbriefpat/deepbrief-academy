CREATE TABLE `email_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`unsubscribe_token` varchar(64) NOT NULL,
	`emails_enabled` boolean NOT NULL DEFAULT true,
	`follow_up_emails` boolean NOT NULL DEFAULT true,
	`weekly_check_ins` boolean NOT NULL DEFAULT true,
	`overdue_alerts` boolean NOT NULL DEFAULT true,
	`frequency` enum('daily','weekly','off') NOT NULL DEFAULT 'daily',
	`unsubscribed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_preferences_unsubscribe_token_unique` UNIQUE(`unsubscribe_token`)
);
--> statement-breakpoint
ALTER TABLE `email_preferences` ADD CONSTRAINT `email_preferences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;