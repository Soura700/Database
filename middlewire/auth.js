const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      next();
    } else {
      return res.redirect("/log")
    }
  } catch (error) {
  }
}
  
  const isLogout = async (req,res,next)=>{
    try {
      if(req.session.user_id ){
        next();
      }
      else{
        return res.redirect("/log")
      }
      next();
    } catch (error) {

    }
  }



 
  module.exports = {
    isLogin,
    isLogout
  }

