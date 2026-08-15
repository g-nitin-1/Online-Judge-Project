const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {

  let token;

  
  if (req.headers.authorization) {
    const [scheme, value] = req.headers.authorization.split(" ");
    if (scheme === "Bearer") token = value;
  }
  if (!token) {
    return res.status(403).send('You are not allowed to make this request..');
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ error: "JWT authentication is not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);


    if (!user) {
        return res.status(403).json({ error: "No user found with this id" });
    }

    req.user = user;

    next();
  } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
  }
};


module.exports=protect;
