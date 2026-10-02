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

  recovered = verifyMessage(
   message,
   signature
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

