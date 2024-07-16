const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/userModel');

passport.use(new GoogleStrategy({
    clientID: "1069755088895-sttrd292vsilkmfmprq8641p2pbctn4q.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    // Check if user already exists in the database
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // If user doesn't exist, create a new user in the database
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value
      });
      await user.save();
    }
    return done(null, user);
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
