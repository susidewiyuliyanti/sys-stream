SELECT group_concat(
  cid || ': ' || name || ' [' || type || ']',
  char(10)
) AS users_schema
FROM pragma_table_info('users');
