const express = require("express");
const router = express.Router();

router.get('/',(req,res)=>{
    return res.json({
        status:0,
        message:"Hii"
    })
})

module.exports = router;
