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
    facebookPost: function (req, res) {
        var userid = req.param("userid");
        var galleryid = req.param("galleryid");
        var message = req.param("message");
        var link = sails.myurl + galleryid;

        function showjson(err, data) {
            Post.save(data, function (response) {
                res.json(response);
            });
        };
        User.facebookpost(userid, message, link, showjson);
    },
    twitterPost: function (req, res) {
        var galleryid = req.param("galleryid");
        var userid = req.param("userid");
        var message = sails.myurl + galleryid;

        function showjson(err, data) {
            Post.save(data, function (response) {
                res.json(response);
            });
        };
        User.twitterpost(userid, message, showjson);
    },
    twitterPostDetail: function (req, res) {
        var userid = req.param("userid");
        var twitterpostid = req.param("twitterpostid");
        var accesstToken = req.param("accessToken");
        var accessTokenSecret = req.param("accessTokenSecret");
        var showjson = function (err, data) {
            Post.save(data, function (response) {
                res.json(data);
            });
        }
        User.twitterPostDetail(twitterpostid, userid, accesstToken, accessTokenSecret, showjson);
    },
    facebookPostDetail: function (req, res) {
        var userid = req.param("userid");
        var fbpostid = req.param("fbpostid");
        var showjson = function (err, data) {
            delete data.data;
            Post.save(data, function (response) {
                res.json(data);
            });
        }
        User.facebookPostDetail(fbpostid, userid, showjson);
    },
    card: function (req, res) {
        var galleryid = req.param("galleryid");
        if (!galleryid || galleryid == "" || !sails.ObjectID.isValid(galleryid)) {
            res.json({
                value: false
            });
        } else {
            Gallery.findone(galleryid, function (data2, errorcallback) {
                var data = {
                    title: "Wohlig Technology",
                    image: sails.myurl + "userimage/" + data2,
                    description: "Wohlig Technology is now a Planet."
                };
                res.view("card", data);
            });
        }

    },
    tracker: function (req, res) {

        function trackstartsnow(trackarr) {
            _.each(trackarr, function (n) {
                if (n.post && n.post[0]) {
                    _.each(n.post, function (m) {
                        if (m.provider == "twitter") {
                            User.twitterPostDetail(m.id_str, n._id, n.token, n.tokenSecret, showjson);
                        } else {
                            User.facebookPostDetail(m.id, n._id, showjson);
                        }
                    });
                }
            });
        }

        User.find(req.body, function (response) {
            trackstartsnow(response);
        });

        var showjson = function (err, data) {
            Post.save(data, function (response) {
                if (response) {

                }
            });
        }
    },
    getdailypost: function (req, res) {
            var date = req.param('date');
            var count = {};
            var postdata = {};
            postdata.count = [];
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });

                }
                if (db) {
                    db.collection("user").aggregate([{
                            $unwind: "$post"
                    }, {
                            $match: {
                                "post.provider": {
                                    $exists: true
                                },
                                $or: [{"post.creationtime": date}]

                            }
                    }, {
                            $group: {
                                _id: "$_id",
                                retweet: {
                                    $sum: '$post.retweet_count'
                                },
                                favorite: {
                                    $sum: '$post.favorite_count'
                                },
                                like: {
                                    $sum: '$post.total_likes'
                                },
                                name: {
                                    $addToSet: "$name"
                                },
                                profilepic: {
                                    $addToSet: "$profilepic"
                                }
                            }
                    },
                        {
                            $project: {
                                _id: 1,
                                retweet: 1,
                                favorite: 1,
                                like: 1,
                                name: 1,
                                profilepic: 1,
                                total: {
                                    $add: ["$like", "$retweet", "$favorite"]
                                }
                            }
                        },
                        {
                            $unwind: "$name"
                        },
                        {
                            $unwind: "$profilepic"
                        }]).toArray(function (err, data2) {
                        if (data2 != null) {
                            console.log(data2);
                            var dailypost = {};
                            dailypost.leaderboard = data2;
                            dailypost.date = date;
                            DailyPost.save(dailypost, function (response) {
                                res.json(dailypost);
                            });
                        }
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        },
    date3leaderboard: function (req, res) {
            var date = req.param('date');
            var count = {};
            var postdata = {};
            postdata.count = [];
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });

                }
                if (db) {
                    db.collection("user").aggregate([{
                            $unwind: "$post"
                    }, {
                            $match: {
                                "post.provider": {
                                    $exists: true
                                },
                                $or: [{"post.creationtime": "17-09-2015"},{"post.creationtime": '18-09-2015'},{"post.creationtime": '19-09-2015'}]

                            }
                    }, {
                            $group: {
                                _id: "$_id",
                                retweet: {
                                    $sum: '$post.retweet_count'
                                },
                                favorite: {
                                    $sum: '$post.favorite_count'
                                },
                                like: {
                                    $sum: '$post.total_likes'
                                },
                                name: {
                                    $addToSet: "$name"
                                },
                                profilepic: {
                                    $addToSet: "$profilepic"
                                }
                            }
                    },
                        {
                            $project: {
                                _id: 1,
                                retweet: 1,
                                favorite: 1,
                                like: 1,
                                name: 1,
                                profilepic: 1,
                                total: {
                                    $add: ["$like", "$retweet", "$favorite"]
                                }
                            }
                        },
                        {
                            $unwind: "$name"
                        },
                        {
                            $unwind: "$profilepic"
                        }]).toArray(function (err, data2) {
                        if (data2 != null) {
                            console.log(data2);
                            var dailypost = {};
                            dailypost.leaderboard = data2;
                            dailypost.date = date;
                            DailyPost.save(dailypost, function (response) {
                                res.json(dailypost);
                            });
                        }
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        },
    
    date5leaderboard: function (req, res) {
            var date = req.param('date');
            var count = {};
            var postdata = {};
            postdata.count = [];
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });

                }
                if (db) {
                    db.collection("user").aggregate([{
                            $unwind: "$post"
                    }, {
                            $match: {
                                "post.provider": {
                                    $exists: true
                                },
                                $or: [{"post.creationtime": "17-09-2015"},{"post.creationtime": '18-09-2015'},{"post.creationtime": '19-09-2015'}]

                            }
                    }, {
                            $group: {
                                _id: "$_id",
                                retweet: {
                                    $sum: '$post.retweet_count'
                                },
                                favorite: {
                                    $sum: '$post.favorite_count'
                                },
                                like: {
                                    $sum: '$post.total_likes'
                                },
                                name: {
                                    $addToSet: "$name"
                                },
                                profilepic: {
                                    $addToSet: "$profilepic"
                                }
                            }
                    },
                        {
                            $project: {
                                _id: 1,
                                retweet: 1,
                                favorite: 1,
                                like: 1,
                                name: 1,
                                profilepic: 1,
                                total: {
                                    $add: ["$like", "$retweet", "$favorite"]
                                }
                            }
                        },
                        {
                            $unwind: "$name"
                        },
                        {
                            $unwind: "$profilepic"
                        }]).toArray(function (err, data2) {
                        if (data2 != null) {
                            console.log(data2);
                            var dailypost = {};
                            dailypost.leaderboard = data2;
                            dailypost.date = date;
                            DailyPost.save(dailypost, function (response) {
                                res.json(dailypost);
                            });
                        }
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        },
    
    date10leaderboard: function (req, res) {
            var date = req.param('date');
            var count = {};
            var postdata = {};
            postdata.count = [];
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });

                }
                if (db) {
                    db.collection("user").aggregate([{
                            $unwind: "$post"
                    }, {
                            $match: {
                                "post.provider": {
                                    $exists: true
                                },
                                $or: [{"post.creationtime": "17-09-2015"},{"post.creationtime": '18-09-2015'},{"post.creationtime": '19-09-2015'}]

                            }
                    }, {
                            $group: {
                                _id: "$_id",
                                retweet: {
                                    $sum: '$post.retweet_count'
                                },
                                favorite: {
                                    $sum: '$post.favorite_count'
                                },
                                like: {
                                    $sum: '$post.total_likes'
                                },
                                name: {
                                    $addToSet: "$name"
                                },
                                profilepic: {
                                    $addToSet: "$profilepic"
                                }
                            }
                    },
                        {
                            $project: {
                                _id: 1,
                                retweet: 1,
                                favorite: 1,
                                like: 1,
                                name: 1,
                                profilepic: 1,
                                total: {
                                    $add: ["$like", "$retweet", "$favorite"]
                                }
                            }
                        },
                        {
                            $unwind: "$name"
                        },
                        {
                            $unwind: "$profilepic"
                        }]).toArray(function (err, data2) {
                        if (data2 != null) {
                            console.log(data2);
                            var dailypost = {};
                            dailypost.leaderboard = data2;
                            dailypost.date = date;
                            DailyPost.save(dailypost, function (response) {
                                res.json(dailypost);
                            });
                        }
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        },
    
        /////////////////////////////////////
};