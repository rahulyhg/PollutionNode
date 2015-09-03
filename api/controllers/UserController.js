var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
        clientID: "1616856265259993",
        clientSecret: "6e8052bdbe29f02ead4f618549e98cac",
        callbackURL: "http://wohlig.biz/user/callbackf"
    },
    function (accessToken, refreshToken, profile, done) {
        done(null, profile);
    }
));

passport.use(new TwitterStrategy({
        consumerKey: "6gOb3JlMDgqYw27fLN29l5Vmp",
        consumerSecret: "kEF99DQQssEZGJnJXvIBVTjuAs2vt1R8wji2OQ9nOc0fhlcVKM",
        callbackURL: "http://wohlig.biz/user/callbackt"
    },
    function (token, tokenSecret, profile, done) {
        done(null, profile);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
    done(null, id);
});

module.exports = {
    save: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.save(req.body, print);
    },
    find: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.find(req.body, print);
    },
    findlimited: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.findlimited(req.body, print);
    },
    findone: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.findone(req.body, print);
    },
    delete: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.delete(req.body, print);
    },
    logint: passport.authenticate('twitter'),
    loginf: passport.authenticate('facebook', {
        scope: 'email,public_profile,user_posts,publish_actions'
    }),
    callbackt: passport.authenticate('twitter', {
        successRedirect: '/user/success',
        failureRedirect: '/user/fail'
    }),
    callbackf: passport.authenticate('facebook', {
        successRedirect: '/user/success',
        failureRedirect: '/user/fail'
    }),
    success: function (req, res, data) {
        console.log(req.session.passport);
        res.send("SUCCESS");
    },
    fail: function (req, res) {
        res.send("FAIL");
    },
    profile: function (req, res) {
        res.send(req.session.passport);
    },
    checkpassport: function (req, res) {
        req.session.passport = {
            name: "Chintan"
        };
        req.session.save(function (err) {
            res.json(req.session);
        })
    },
    logout: function (req, res) {
        req.session.destroy(function (err) {
            res.send(req.session);
        });
    }
};