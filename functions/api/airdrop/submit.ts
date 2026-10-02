export async function onRequestPost(context:any){

const db = context.env.DB;

try {

const body = await context.request.json();

const {
email,
wallet,
taskId,
link
}=body;


if(!email || !wallet || !taskId || !link){

return Response.json({
success:false,
message:"Data tidak lengkap"
},{
status:400
});

}


const task = await db.prepare(`
SELECT reward
FROM airdrop_tasks
WHERE id=?
`)
.bind(taskId)
.first();



if(!task){

return Response.json({
success:false,
message:"Task tidak ditemukan"
},{
status:404
});

}



await db.prepare(`
INSERT INTO airdrop_submissions
(
wallet_address,
email,
task_id,
evidence_link,
status,
reward_points
)
VALUES
(?,?,?,?,?,?)
`)
.bind(
wallet,
email,
taskId,
link,
"PENDING",
task.reward
)
.run();



return Response.json({

success:true,

message:"Submission berhasil",

status:"PENDING"

});



}catch(error){


return Response.json({

success:false,

error:String(error)

},{
status:500
});


}


}