CREATE TABLE `pressure_audit_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`responses` text NOT NULL,
	`total_score` int NOT NULL,
	`tier` enum('Surface Level','Thermocline','Deep Water','Crush Depth') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pressure_audit_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `pressure_audit_responses` ADD CONSTRAINT `pressure_audit_responses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;