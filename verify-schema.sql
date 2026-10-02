SELECT name, type
FROM sqlite_master
WHERE type IN ('table','index')
ORDER BY type, name;
