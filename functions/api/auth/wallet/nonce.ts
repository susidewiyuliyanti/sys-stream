export async function onRequestPost(context:any){

 const body = await context.request.json();

 const wallet =
  String(body.wallet || "").toLowerCase();


 if(!wallet){

  return Response.json(
   {
    error:"Wallet required"
   },
   {
    status:400
   }
  );

 }


 const nonce =
  crypto.randomUUID();


 await context.env.DB.prepare(
 `
 INSERT INTO wallet_nonces(
  wallet,
  nonce,
  created_at
 )
 VALUES(
  ?,
  ?,
  ?
 )
 `
 )
 .bind(
  wallet,
  nonce,
  Date.now()
 )
 .run();


 return Response.json({
  nonce
 });

}
