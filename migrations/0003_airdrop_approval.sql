ALTER TABLE task_submissions
ADD COLUMN reviewed_by TEXT;

ALTER TABLE task_submissions
ADD COLUMN reviewed_at DATETIME;

ALTER TABLE task_submissions
ADD COLUMN reward_given INTEGER DEFAULT 0;
