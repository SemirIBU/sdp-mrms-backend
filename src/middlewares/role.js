module.exports = function(roles){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({ error: 'no user' });
    if(!roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
};
