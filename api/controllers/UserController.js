var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
        clientID: "1616856265259993",
        clientSecret: "6e8052bdbe29f02ead4f618549e98cac",
        callbackURL: "http://wohlig.biz/user/callbackf"
    },
    function (accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        profile.provider = "Facebook";
        User.findorcreate(profile, done);
    }
));

passport.use(new TwitterStrategy({
        consumerKey: "6gOb3JlMDgqYw27fLN29l5Vmp",
        consumerSecret: "kEF99DQQssEZGJnJXvIBVTjuAs2vt1R8wji2OQ9nOc0fhlcVKM",
        callbackURL: "http://wohlig.biz/user/callbackt"
    },
    function (token, tokenSecret, profile, done) {
        profile.token = token;
        profile.tokenSecret = tokenSecret;
        profile.provider = "Twitter";
        User.findorcreate(profile, done);
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
    findorcreate: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.findorcreate(req.body, print);
    },
    /////////////////////////////
    //LOGIN FUNCTIONS
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
        res.send("SUCCESS");
    },
    fail: function (req, res) {
        res.send("FAIL");
    },
    logout: function (req, res) {
            req.session.destroy(function (err) {
                res.send(req.session);
            });
        },
    facebookPost: function(req,res) {
        var message=req.param("message");
        var link=req.param("link");
        function showjson(data)
        {
            res.json(data);
        };
        User.facebookpost(message,link,showjson);
        
    },
    twitterPost:function(req,res) {
        var message=req.param("message");
        function showjson(data)
        {
            res.json(data);
        };
        User.twitterpost(message,showjson);
    }
        //////////////////////////////////////
};