CREATE TABLE `session_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` int,
	`demo_session_id` int,
	`guest_pass_session_id` int,
	`message_index` int NOT NULL,
	`feedback_type` enum('helpful','not_helpful') NOT NULL,
	`comment` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `session_feedback` ADD CONSTRAINT `session_feedback_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_feedback` ADD CONSTRAINT `session_feedback_session_id_coaching_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `coaching_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_feedback` ADD CONSTRAINT `session_feedback_demo_session_id_coaching_demo_sessions_id_fk` FOREIGN KEY (`demo_session_id`) REFERENCES `coaching_demo_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_feedback` ADD CONSTRAINT `session_feedback_guest_pass_session_id_guest_pass_sessions_id_fk` FOREIGN KEY (`guest_pass_session_id`) REFERENCES `guest_pass_sessions`(`id`) ON DELETE no action ON UPDATE no action;