SELECT name, sql
FROM sqlite_master
WHERE type='table'
AND name IN ('auth_sessions','deposits','blind_box_claims','game_settings')
ORDER BY name;
