const jwt=require('jsonwebtoken')

function verifyToken(req,res,next){
  // get bearer token from headers of req
  const bearerToken=req.headers.authorization;
  // if bearer token not available
  if(!bearerToken){
    return res.send({message:"Unathorized access. Plz login to continue"})
  }
  // extract token from bearer token
  const token=bearerToken.split(' ')[1]
  try{
    jwt.verify(token,"DevDynamos")
    next();
  }catch(err){
    next(err);
  }
}

module.exports=verifyToken