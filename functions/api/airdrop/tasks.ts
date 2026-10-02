export async function onRequestGet(context:any){

const db=context.env.DB;


const result = await db.prepare(`
SELECT 
id,
title,
description,
category,
reward
FROM airdrop_tasks
WHERE active=1
ORDER BY id ASC
`).all();


return Response.json({
success:true,
tasks:result.results
});


}