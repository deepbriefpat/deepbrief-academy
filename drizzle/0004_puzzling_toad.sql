CREATE TABLE `commitment_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commitment_id` int NOT NULL,
	`user_id` int,
	`notification_type` enum('deadline_24h','deadline_1h','overdue','reminder') NOT NULL,
	`channel` enum('email','in_app','push') NOT NULL,
	`status` enum('pending','sent','failed','read') NOT NULL DEFAULT 'pending',
	`sent_at` timestamp,
	`read_at` timestamp,
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commitment_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commitment_progress_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commitment_id` int NOT NULL,
	`user_id` int,
	`previous_progress` int NOT NULL,
	`new_progress` int NOT NULL,
	`previous_status` varchar(50),
	`new_status` varchar(50),
	`progress_note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commitment_progress_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `commitment_notifications` ADD CONSTRAINT `commitment_notifications_commitment_id_coaching_commitments_id_fk` FOREIGN KEY (`commitment_id`) REFERENCES `coaching_commitments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commitment_notifications` ADD CONSTRAINT `commitment_notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commitment_progress_history` ADD CONSTRAINT `commitment_progress_history_commitment_id_coaching_commitments_id_fk` FOREIGN KEY (`commitment_id`) REFERENCES `coaching_commitments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commitment_progress_history` ADD CONSTRAINT `commitment_progress_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;