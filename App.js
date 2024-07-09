const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

const app = express();
const prisma = new PrismaClient();

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(helmet()); 

app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  delayMs: 0, 
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.post('/referrals', async (req, res) => {
  try {
    const { referrerName,
      referrerEmail,
      referrerPhone,
      referrerID,
      refereeName,
      refereeEmail,
      refereePhone } = req.body;
      
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        referrerPhone,
        referrerID,
        refereeName,
        refereeEmail,
        refereePhone
      },
    });
    sendReferralEmail(referral); 
    res.json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating referral' });
  }
});

app.get('/',(req,res)=>{
  res.send('hello from the home page')
})
app.get('/referrals', async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany();
    res.json(referrals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching referrals' });
  }
});

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USERNAME,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });
  

  async function sendReferralEmail(referral) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: referral.referrerEmail,
        subject: 'New Referral Submission',
        text: `Name: ${referral.refereeName}\nEmail: ${referral.refereeEmail}\nPhone: ${referral.refereePhone}\n has been successfully referred by you for the further process`,
      };
      const mailOptions2 = {
        from: process.env.EMAIL_USERNAME,
        to: referral.refereeEmail,
        subject: `You have been referred by ${referral.referrerName} for further process` ,
        text: `Congratulations for being referred for the next step with given details Name: ${referral.refereeName}\nEmail: ${referral.refereeEmail}\nPhone: ${referral.refereePhone}\n`,
      };
      await transporter.sendMail(mailOptions);
      await transporter.sendMail(mailOptions2);
      console.log('Referral email sent successfully');
    } catch (error) {
      console.error(error);
    }
  }
  



app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal Server Error' });
});


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});