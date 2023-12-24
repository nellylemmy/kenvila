const rateLimiterMessage = `<style>
section{
max-width:30rem;
margin:5rem auto;
}
.card {
display: flex;
flex-direction: column;
border: 1px red solid;
}
.header {
height: 30%;
background: red;
color: white;
text-align: center;
font-size: 1.3rem;
font-weight: 600;
}
.container {
padding: 2px 16px;
}
</style>

<section>
<div class="card">
<div class="header">
<p>Too Many Request! Please Wait for 15 minutes</p>
</div>
<div class="container">
<p>We apologize for the inconvenience, but it seems that there has been unusual activity detected from your device. To ensure the security of your account, we have temporarily restricted access for the next 15 minutes. This precautionary measure helps us protect your account from potential unauthorized access.
</p>

<p>
If you have forgotten your account information or need assistance, please don't hesitate to contact our support team. We'll be happy to assist you in recovering your account.
</p>

<p>Thank you for your understanding and cooperation in maintaining the security of your account.</p>
</div>
</div>
</section>`;

module.exports = rateLimiterMessage;