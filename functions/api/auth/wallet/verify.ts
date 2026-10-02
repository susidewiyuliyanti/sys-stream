import { verifyMessage } from "ethers";

export async function onRequestPost(context:any){

 const {
  wallet,
  signature,
  message
 } = await context.request.json();

 if(!wallet || !signature || !message){
  return Response.json(
   {
    error:"Missing wallet data"
   },
   {
    status:400
   }
  );
 }

 let recovered;

 try{
  const nonceRow:any = await context.env.DB.prepare(
   "SELECT nonce FROM wallet_nonces WHERE wallet = ? LIMIT 1"
  ).bind(String(wallet).toLowerCase()).first();

  if(!nonceRow?.nonce){
   return Response.json(
    { error:"Wallet nonce tidak ditemukan atau sudah digunakan. Silakan coba lagi." },
    { status:401 }
   );
  }

  const expectedMessage =
   "SYS STREAMER LOGIN\n\nNonce:" + String(nonceRow.nonce);

  if(String(message) !== expectedMessage){
   return Response.json(
    { error:"Invalid wallet message" },
    { status:401 }
   );
  }

  recovered = verifyMessage(
   String(message),
   String(signature)
  );

 }catch(e){

  return Response.json(
   {
    error:"Invalid signature"
   },
   {
    status:401
   }
  );

 }

 if(
  recovered.toLowerCase()
  !==
  wallet.toLowerCase()
 ){

  return Response.json(
   {
    error:"Wallet mismatch"
   },
   {
    status:401
   }
  );

 }

 let user =
  await context.env.DB.prepare(`
   SELECT *
   FROM users
   WHERE wallet_address = ?
  `)
  .bind(wallet.toLowerCase())
  .first();

 if(!user){

  const id =
   crypto.randomUUID();

  await context.env.DB.prepare(`
   INSERT INTO users(
    id,
    wallet_address,
    role
   )
   VALUES(?,?,?)
  `)
  .bind(
   id,
   wallet.toLowerCase(),
   "USER"
  )
  .run();

  user =
   await context.env.DB.prepare(`
    SELECT *
    FROM users
    WHERE wallet_address = ?
   `)
   .bind(wallet.toLowerCase())
   .first();
 }

 const token =
  crypto.randomUUID();

 await context.env.DB.prepare(`
  INSERT INTO auth_sessions(
   token,
   user_id,
   expires_at
  )
  VALUES(?,?,?)
 `)
 .bind(
  token,
  user.id,
  Date.now()+86400000
 )
 .run();

 return Response.json({
  token,
  user
 });

}

