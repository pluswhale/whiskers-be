app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  // Exchange the authorization code for an access token
  const tokenResponse = await axios.post(`https://api.telegram.org/bot${botToken}/getToken`, {
    code,
    client_id: '<YOUR_CLIENT_ID>',
    client_secret: '<YOUR_CLIENT_SECRET>',
    redirect_uri: 'https://your-web-app.com/auth/callback'
  });

  const accessToken = tokenResponse.data.access_token;

  // Use the access token to fetch user information
  const userResponse = await axios.get(`https://api.telegram.org/bot${botToken}/getMe?access_token=${accessToken}`);

    const userData = userResponse.data;
    
  // Handle user data here (e.g., save it to a database, display it in the web app, etc.)

  res.send(userData);
});