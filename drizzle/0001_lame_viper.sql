CREATE TABLE `webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`processed` boolean NOT NULL DEFAULT true,
	`processed_at` timestamp NOT NULL DEFAULT (now()),
	`payload` text,
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhook_events_event_id_unique` UNIQUE(`event_id`)
);
