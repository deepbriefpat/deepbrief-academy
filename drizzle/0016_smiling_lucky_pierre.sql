CREATE TABLE `guest_pass_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guest_pass_id` int NOT NULL,
	`recipient_email` varchar(255) NOT NULL,
	`recipient_name` varchar(255),
	`personal_message` text,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`sent_at` timestamp,
	`opened_at` timestamp,
	`reminder_sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guest_pass_invitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `guest_pass_invitations` ADD CONSTRAINT `guest_pass_invitations_guest_pass_id_guest_passes_id_fk` FOREIGN KEY (`guest_pass_id`) REFERENCES `guest_passes`(`id`) ON DELETE no action ON UPDATE no action;