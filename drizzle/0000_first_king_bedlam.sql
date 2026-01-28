CREATE TABLE `assessment_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` varchar(64) NOT NULL,
	`responses` text NOT NULL,
	`depth_level` enum('surface','thermocline','deep_water','crush_depth') NOT NULL,
	`score` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessment_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `behavioral_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`guest_pass_code` varchar(64),
	`insight_type` enum('avoidance','over_indexing','pressure_response','decision_pattern','blind_spot') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`evidence` text NOT NULL,
	`confidence` int NOT NULL,
	`surfaced_at` timestamp,
	`acknowledged_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `behavioral_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`coaching_user_id` int,
	`user_id` int,
	`guest_pass_code` varchar(64),
	`session_id` int,
	`goal_id` int,
	`action` text NOT NULL,
	`context` text,
	`deadline` timestamp,
	`status` enum('pending','in_progress','completed','missed','open','closed','overdue','abandoned') NOT NULL DEFAULT 'pending',
	`progress` int NOT NULL DEFAULT 0,
	`completed_at` timestamp,
	`closed_at` timestamp,
	`closed_note` text,
	`notes` text,
	`follow_up_count` int NOT NULL DEFAULT 0,
	`last_follow_up_at` timestamp,
	`check_in_email_sent` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaching_commitments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_demo_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fingerprint` varchar(255) NOT NULL,
	`ip_address` varchar(45),
	`interaction_count` int NOT NULL DEFAULT 0,
	`messages` text,
	`converted_to_subscription` boolean DEFAULT false,
	`user_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`last_interaction_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_demo_sessions_id` PRIMARY KEY(`id`)
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
	`mode` enum('coaching','execution') NOT NULL DEFAULT 'coaching',
	`context` text,
	`messages` text NOT NULL,
	`insights` text,
	`action_items` text,
	`notes` text,
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
	`preferred_name` varchar(100),
	`profile_picture_url` varchar(500),
	`role` varchar(100) NOT NULL,
	`experience_level` enum('first_time','mid_level','senior','executive') NOT NULL,
	`goals` text NOT NULL,
	`pressures` text NOT NULL,
	`challenges` text NOT NULL,
	`decision_bottlenecks` text,
	`team_dynamics` text,
	`baseline_score` int,
	`coaching_preferences` text,
	`has_completed_onboarding` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaching_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `email_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`source` enum('assessment_results','booking_confirmation','general','calm_protocol','pressure_guide_modal','pressure_audit') NOT NULL,
	`subscribed` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
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
CREATE TABLE `guest_pass_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guest_pass_id` int NOT NULL,
	`fingerprint` varchar(255) NOT NULL,
	`messages` text,
	`message_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`last_interaction_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guest_pass_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guest_passes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`label` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp,
	`usage_count` int NOT NULL DEFAULT 0,
	`last_used_at` timestamp,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guest_passes_id` PRIMARY KEY(`id`),
	CONSTRAINT `guest_passes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(255),
	`inquiry_type` enum('pressure_audit','peer_group','general') NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','contacted','closed') NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`step` int NOT NULL,
	`action` enum('view','complete','skip','abandon') NOT NULL,
	`time_spent` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `onboarding_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`theme` enum('pressure_management','diving_metaphors','leadership_isolation','vulnerability') NOT NULL,
	`image_url` varchar(512),
	`linkedin_url` varchar(512),
	`impressions` int DEFAULT 0,
	`reactions` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`view_count` int NOT NULL DEFAULT 0,
	`last_viewed_at` timestamp,
	`published_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resources_id` PRIMARY KEY(`id`),
	CONSTRAINT `resources_slug_unique` UNIQUE(`slug`)
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
CREATE TABLE `session_contexts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`guest_pass_code` varchar(64),
	`key_themes` text NOT NULL,
	`avoidance_patterns` text,
	`pressure_responses` text,
	`decision_patterns` text,
	`last_updated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_contexts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`image_url` varchar(512),
	`category` enum('diving','business','leadership','personal') NOT NULL,
	`featured` int NOT NULL DEFAULT 0,
	`published_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`),
	CONSTRAINT `stories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `support_network_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` varchar(64) NOT NULL,
	`responses` text NOT NULL,
	`network_score` int NOT NULL,
	`network_quality` enum('isolated','emerging','functional','thriving') NOT NULL,
	`recommendations` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_network_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`author_role` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`outcome` text,
	`featured` int NOT NULL DEFAULT 0,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`selectedCoach` varchar(64) DEFAULT 'sarah',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `assessment_responses` ADD CONSTRAINT `assessment_responses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `behavioral_insights` ADD CONSTRAINT `behavioral_insights_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_analytics` ADD CONSTRAINT `coaching_analytics_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD CONSTRAINT `coaching_commitments_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD CONSTRAINT `coaching_commitments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD CONSTRAINT `coaching_commitments_session_id_coaching_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `coaching_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD CONSTRAINT `coaching_commitments_goal_id_coaching_goals_id_fk` FOREIGN KEY (`goal_id`) REFERENCES `coaching_goals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_demo_sessions` ADD CONSTRAINT `coaching_demo_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_goals` ADD CONSTRAINT `coaching_goals_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_nudges` ADD CONSTRAINT `coaching_nudges_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_nudges` ADD CONSTRAINT `coaching_nudges_commitment_id_coaching_commitments_id_fk` FOREIGN KEY (`commitment_id`) REFERENCES `coaching_commitments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_sessions` ADD CONSTRAINT `coaching_sessions_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_subscriptions` ADD CONSTRAINT `coaching_subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_template_usage` ADD CONSTRAINT `coaching_template_usage_coaching_user_id_coaching_users_id_fk` FOREIGN KEY (`coaching_user_id`) REFERENCES `coaching_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_template_usage` ADD CONSTRAINT `coaching_template_usage_template_id_coaching_templates_id_fk` FOREIGN KEY (`template_id`) REFERENCES `coaching_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_users` ADD CONSTRAINT `coaching_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_preferences` ADD CONSTRAINT `email_preferences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guest_pass_invitations` ADD CONSTRAINT `guest_pass_invitations_guest_pass_id_guest_passes_id_fk` FOREIGN KEY (`guest_pass_id`) REFERENCES `guest_passes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guest_pass_sessions` ADD CONSTRAINT `guest_pass_sessions_guest_pass_id_guest_passes_id_fk` FOREIGN KEY (`guest_pass_id`) REFERENCES `guest_passes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guest_passes` ADD CONSTRAINT `guest_passes_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboarding_analytics` ADD CONSTRAINT `onboarding_analytics_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pressure_audit_responses` ADD CONSTRAINT `pressure_audit_responses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_comments` ADD CONSTRAINT `resource_comments_resource_id_resources_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_comments` ADD CONSTRAINT `resource_comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_reactions` ADD CONSTRAINT `resource_reactions_resource_id_resources_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_reactions` ADD CONSTRAINT `resource_reactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sent_emails` ADD CONSTRAINT `sent_emails_subscriber_id_email_subscribers_id_fk` FOREIGN KEY (`subscriber_id`) REFERENCES `email_subscribers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sent_emails` ADD CONSTRAINT `sent_emails_sequence_id_email_sequences_id_fk` FOREIGN KEY (`sequence_id`) REFERENCES `email_sequences`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_contexts` ADD CONSTRAINT `session_contexts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_feedback` ADD CONSTRAINT `session_feedback_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_feedback` ADD CONSTRAINT `session_feedback_session_id_coaching_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `coaching_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_feedback` ADD CONSTRAINT `session_feedback_demo_session_id_coaching_demo_sessions_id_fk` FOREIGN KEY (`demo_session_id`) REFERENCES `coaching_demo_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_feedback` ADD CONSTRAINT `session_feedback_guest_pass_session_id_guest_pass_sessions_id_fk` FOREIGN KEY (`guest_pass_session_id`) REFERENCES `guest_pass_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_network_assessments` ADD CONSTRAINT `support_network_assessments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;