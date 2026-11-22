const express=require("express");
const app=express();
const PORT=5000;

app.get("/",(req,res)=>{
    res.send("Hospital Management System Backend is running");
})

app.get("/api/health",(req,res)=>{
    res.json({
        success:true,
        message:"HMS Backend is running",
        Status:"OK"
    })
})



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});