-- Priority creator task: paid separately in USDT after manual view verification.
INSERT INTO airdrop_tasks (title, description, category, reward_points, active)
SELECT
  'Priority USDT Task: YouTube Review Video',
  'Create and publish an original YouTube video at least 15 minutes long reviewing SysStreamer and/or explaining how to complete tasks on the platform. Your channel must have at least 1,000 subscribers. Submit only after the public video reaches at least 1,000 views. Submit the public YouTube URL as proof. Reward: $2 USDT per 1,000 verified views, subject to manual review. Videos must be original and public; artificial or purchased views are not eligible.',
  'paid_review',
  0,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM airdrop_tasks WHERE category = 'paid_review'
);
