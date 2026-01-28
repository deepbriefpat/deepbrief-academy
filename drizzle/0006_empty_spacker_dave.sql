CREATE TABLE `resource_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resource_id` int NOT NULL,
	`user_id` int NOT NULL,
	`parent_id` int,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resource_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resource_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resource_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `resource_comments` ADD CONSTRAINT `resource_comments_resource_id_resources_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_comments` ADD CONSTRAINT `resource_comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_reactions` ADD CONSTRAINT `resource_reactions_resource_id_resources_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_reactions` ADD CONSTRAINT `resource_reactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;