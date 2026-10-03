export async function onRequestGet(context:any){
  const wallet=String(new URL(context.request.url).searchParams.get('wallet')||'').trim();
  if(!wallet) return Response.json({success:true,submissions:[]});
  try{
    const result=await context.env.DB.prepare(
      `SELECT s.id,s.task_id,t.title AS task_title,s.evidence_link,s.status,s.reward_points,s.created_at
       FROM airdrop_submissions s
       LEFT JOIN airdrop_tasks t ON t.id=s.task_id
       WHERE s.wallet_address=?
       ORDER BY s.id DESC`
    ).bind(wallet).all();
    return Response.json({success:true,submissions:result.results||[]});
  }catch(error){return Response.json({success:false,error:String(error),submissions:[]},{status:500});}
}
