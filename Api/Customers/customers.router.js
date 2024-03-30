const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require("mssql/msnodesqlv8");
const nodemailer = require("nodemailer");

//Create Account
router.post("/signup", async (req, res) => {
  const customerID = Math.floor(Math.random() * 100000);
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 10);

  new sql.Request().query(
    `select * from Customers where Email = '${email}' and Phone_Number = '${phoneNumber}'`,
    (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      } else {
        if (result.recordset[0]) {
          res.status(409).send({
            message: "This user exists",
          });
        } else {
          new sql.Request().query(
            `insert into Customers (Customer_ID, First_Name, Last_Name, Email, Phone_Number, Password) values ('${customerID}', '${firstName}', '${lastName}', '${email}', '${phoneNumber}', '${hashedPassword}')`,
            (err, results) => {
              if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
              } else {
                console.log(results);
                res.status(200).send("Customer added");
              }
            }
          );
        }
        console.log(result);
      }
    }
  );
});

//Login
router.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  new sql.Request().query(
    `select * from Customers where Email = '${email}'`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      } else if (result.recordsets[0].length === 0) {
        console.log(result);
        res.status(401).send("Incorrect Email or Password");
      } else if (result.recordsets[0].length > 0) {
        const compare = bcrypt.compareSync(
          password,
          result.recordset[0].Password
        );
        if (compare) {
          res.status(200).send("Login Successful");
        } else {
          res.status(401).send("Incorrect Email or Password");
        }
      }

      console.log(result);
    }
  );
});

//Update Password
router.put("/resetpassword", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 10);

  new sql.Request().query(
    `update Customers set Password = '${hashedPassword}' where Email = '${email}'`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.recordsets) {
        console.log(result);
        res.status(200).send("Password updated successfully");
      }
    }
  );
});

//Email Verification
router.post("/verifyemail", async (req, res) => {
  const email = req.body.email;
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "tillman.prohaska@ethereal.email",
      pass: "PcPNhTsKnDnsRguKRn",
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Utibu Health" <tillman.prohaska@ethereal.email">', // sender address
      to: email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }
  main();
  // res.status(200).message("sent")
});

module.exports = router;
