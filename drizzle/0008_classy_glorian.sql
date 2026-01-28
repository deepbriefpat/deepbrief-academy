CREATE TABLE `email_sequences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`trigger_source` varchar(100) NOT NULL,
	`delay_days` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_sequences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sent_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriber_id` int NOT NULL,
	`sequence_id` int NOT NULL,
	`sent_at` timestamp NOT NULL DEFAULT (now()),
	`status` enum('sent','failed') NOT NULL,
	CONSTRAINT `sent_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sent_emails` ADD CONSTRAINT `sent_emails_subscriber_id_email_subscribers_id_fk` FOREIGN KEY (`subscriber_id`) REFERENCES `email_subscribers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sent_emails` ADD CONSTRAINT `sent_emails_sequence_id_email_sequences_id_fk` FOREIGN KEY (`sequence_id`) REFERENCES `email_sequences`(`id`) ON DELETE no action ON UPDATE no action;