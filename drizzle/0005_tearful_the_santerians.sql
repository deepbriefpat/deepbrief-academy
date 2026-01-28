ALTER TABLE `resources` ADD `view_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `last_viewed_at` timestamp;