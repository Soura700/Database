const router = require("express").Router();
const { Appointment } = require("../models/appointment.model");
const {check,validationResult} = require("express-validator");

// Create Appoitment
router.post("/appoitment", [
  check('username','Username is not valid')
  .notEmpty()
  .withMessage('Username cannot be empty'),
  check('department','Department is not valid')
  .notEmpty()
  .withMessage('Department cannot be empty'),
  check('doctors','Doctors is not valid')
  .notEmpty()
  .withMessage('Doctors cannot be empty'),
  check('date','Date is not valid')
  .notEmpty()
  .withMessage('Date cannot be empty'),
  check('phone','Phone is not valid')
  .notEmpty()
  .withMessage('Phone cannot be empty'),
  check('time','Time is not valid')
  .notEmpty()
  .withMessage('Time cannot be empty'),
],
async (req, res) => {
  const errors = validationResult(req)
  const errorMessages = errors.array().map(error =>`<div class="alert alert-warning" role="alert">${error.msg}</div>`).join('');
  if(!errors.isEmpty()){
    return res.status(400).send(errorMessages);
  }
  else{
    const newAppoitment = new Appointment(req.body);
    try {
      const saveAppoitment =await newAppoitment.save();
      res.status(200).redirect("/success");
    } catch (error) {
      res.status(500).send(error);
    }
  }
  });  
  
  // All appotments
  router.get("/all", async (req, res) => {
    try {
      const appoitments = await Appointment.find();
      res.status(200).json(appoitments);
    } catch (error) {
      res.status(500).json(error);
    }
  });
  
  // Delete Appoitment from admin panel
  router.delete("/delete/:id",async(req,res)=>{
    const deletedPatient = await Appointment.findById(req.params.id);
    try{
      await deletedPatient.delete();
      res.status(200).json(deletedPatient);
    }catch(error){
      res.status(500).json(error)
    }
  })
  
  // Get single appoitment by id 
  router.get("/app/:id",async(req,res)=>{
    try{
     const appoinmentSingle = await Appointment.findById(req.params.id);
      res.status(200).json(appoinmentSingle);
    }catch(error){
      res.status(500).json(error)
    }
  })

// Update Appoitment
router.put("/update/:id",async(req,res)=>{
  const appointment = await Appointment.findById(req.params.id);
  try{
    const updataAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        $set:req.body,
      },
      {
        new:true
      }
      );
    res.status(200).json(updataAppointment);
  }catch(error){
    res.status(500).json(error);
  }
})

module.exports = router;
