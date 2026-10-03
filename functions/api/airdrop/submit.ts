export async function onRequestPost(context:any){
  const db=context.env.DB;
  try{
    const body=await context.request.json().catch(()=>({}));
    const wallet=String(body.wallet||'').trim();
    const taskKey=String(body.taskKey||'').trim();
    const rawTaskId=String(body.taskId||'').trim();
    const link=String(body.link||'').trim();
    if(!wallet||(!taskKey&&!rawTaskId)||!link) return Response.json({success:false,message:'Wallet, task, dan bukti wajib diisi'},{status:400});
    if(wallet.length<10||wallet.length>120) return Response.json({success:false,message:'Alamat wallet tidak valid'},{status:400});
    let task:any=null;
    if(/^\\d+$/.test(rawTaskId)) task=await db.prepare('SELECT id,title,reward_points FROM airdrop_tasks WHERE id=? AND active=1').bind(Number(rawTaskId)).first();
    if(!task&&taskKey) task=await db.prepare('SELECT id,title,reward_points FROM airdrop_tasks WHERE active=1 AND lower(category)=lower(?) LIMIT 1').bind(taskKey).first();
    if(!task&&taskKey) task=await db.prepare('SELECT id,title,reward_points FROM airdrop_tasks WHERE active=1 AND lower(title) LIKE ? LIMIT 1').bind('%'+taskKey.toLowerCase()+'%').first();
    if(!task) return Response.json({success:false,message:'Task tidak ditemukan atau belum diaktifkan'},{status:404});
    const existing=await db.prepare('SELECT id,status FROM airdrop_submissions WHERE wallet_address=? AND task_id=? AND status IN (\'PENDING\',\'APPROVED\') ORDER BY id DESC LIMIT 1').bind(wallet,task.id).first();
    if(existing) return Response.json({success:false,message:'Task ini sudah pernah diajukan untuk wallet tersebut',status:existing.status},{status:409});
    await db.prepare('INSERT INTO airdrop_submissions (wallet_address,email,task_id,evidence_link,status,reward_points) VALUES (?,?,?,?,?,?)').bind(wallet,wallet,task.id,link,'PENDING',Number(task.reward_points||0)).run();
    return Response.json({success:true,message:'Submission berhasil dan menunggu review',status:'PENDING',taskId:task.id});
  }catch(error){return Response.json({success:false,error:String(error)},{status:500});}
}
