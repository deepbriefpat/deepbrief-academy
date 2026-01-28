CREATE TABLE `coaching_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coaching_user_id` int NOT NULL,
	`week_start_date` date NOT NULL,
	`sessions_count` int DEFAULT 0,
	`commitments_completed` int DEFAULT 0,
	`commitments_missed` int DEFAULT 0,
	`goals_progress` text,
	`behavior_patterns` text,
	`confidence_shift` int,
	`wins` text,
	`lessons` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_commitments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coaching_user_id` int NOT NULL,
	`session_id` int,
	`goal_id` int,
	`action` text NOT NULL,
	`deadline` timestamp,
	`status` enum('pending','in_progress','completed','missed') NOT NULL DEFAULT 'pending',
	`completed_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_commitments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coaching_user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('leadership','communication','decision_making','team_building','personal_growth') NOT NULL,
	`target_date` timestamp,
	`status` enum('active','completed','paused','abandoned') NOT NULL DEFAULT 'active',
	`progress` int DEFAULT 0,
	`milestones` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completed_at` timestamp,
	CONSTRAINT `coaching_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_nudges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coaching_user_id` int NOT NULL,
	`commitment_id` int,
	`type` enum('reminder','check_in','celebration','course_correct') NOT NULL,
	`message` text NOT NULL,
	`scheduled_for` timestamp NOT NULL,
	`sent_at` timestamp,
	`responded_at` timestamp,
	`response` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_nudges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coaching_user_id` int NOT NULL,
	`session_type` enum('general','situational','roleplay','check_in') NOT NULL,
	`context` text,
	`messages` text NOT NULL,
	`insights` text,
	`action_items` text,
	`duration` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`stripe_customer_id` varchar(255),
	`stripe_subscription_id` varchar(255),
	`status` enum('active','canceled','past_due','trialing','incomplete') NOT NULL,
	`current_period_start` timestamp,
	`current_period_end` timestamp,
	`cancel_at_period_end` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaching_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `coaching_subscriptions_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `coaching_subscriptions_stripe_customer_id_unique` UNIQUE(`stripe_customer_id`),
	CONSTRAINT `coaching_subscriptions_stripe_subscription_id_unique` UNIQUE(`stripe_subscription_id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_template_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coaching_user_id` int NOT NULL,
	`template_id` int NOT NULL,
	`customizations` text,
	`is_favorite` boolean DEFAULT false,
	`used_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_template_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('tough_conversation','goal_setting','one_on_one','delegation','feedback','conflict_resolution') NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`prompts` text,
	`is_public` boolean DEFAULT true,
	`usage_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaching_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`role` varchar(100) NOT NULL,
	`experience_level` enum('first_time','mid_level','senior','executive') NOT NULL,
	`goals` text NOT NULL,
	`pressures` text NOT NULL,
	`challenges` text NOT NULL,
	`decision_bottlenecks` text,
	`team_dynamics` text,
	`baseline_score` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaching_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coaching_analytics` ADD CONSTRAINT `coaching_analytics_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD CONSTRAINT `coaching_commitments_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD CONSTRAINT `coaching_commitments_session_id_coaching_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `coaching_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD CONSTRAINT `coaching_commitments_goal_id_coaching_goals_id_fk` FOREIGN KEY (`goal_id`) REFERENCES `coaching_goals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_goals` ADD CONSTRAINT `coaching_goals_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_nudges` ADD CONSTRAINT `coaching_nudges_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_nudges` ADD CONSTRAINT `coaching_nudges_commitment_id_coaching_commitments_id_fk` FOREIGN KEY (`commitment_id`) REFERENCES `coaching_commitments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_sessions` ADD CONSTRAINT `coaching_sessions_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_subscriptions` ADD CONSTRAINT `coaching_subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_template_usage` ADD CONSTRAINT `coaching_template_usage_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_template_usage` ADD CONSTRAINT `coaching_template_usage_template_id_coaching_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `coaching_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_users` ADD CONSTRAINT `coaching_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;