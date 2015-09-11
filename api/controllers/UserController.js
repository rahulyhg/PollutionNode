var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;


passport.use(new FacebookStrategy({
        clientID: "1616856265259993",
        clientSecret: "6e8052bdbe29f02ead4f618549e98cac",
        callbackURL: sails.myurl + "user/callbackf"
    },
    function (accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        profile.provider = "Facebook";
        User.findorcreate(profile, done);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
    done(null, id);
});
var request = require('request');
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
    getOneUser: function (req, res) {
        var user = req.param("user");
        if (user && sails.ObjectID.isValid(user)) {
            function callback(data) {
                res.json(data);
            };
            User.getOneUser(user, callback);
        } else {
            return res.badRequest();
        }
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
    logint: function (req, res) {
        var user = req.param("user");

        passport.use(new TwitterStrategy({
                consumerKey: "6gOb3JlMDgqYw27fLN29l5Vmp",
                consumerSecret: "kEF99DQQssEZGJnJXvIBVTjuAs2vt1R8wji2OQ9nOc0fhlcVKM",
                callbackURL: sails.myurl + "user/callbackt"
            },
            function (token, tokenSecret, profile, done) {
                console.log("Twitter Page");
                profile.token = token;
                profile.tokenSecret = tokenSecret;
                profile.provider = "Twitter";
                if (user && sails.ObjectID.isValid(user)) {
                    profile._id = user;
                }
                User.findorcreate(profile, done);
            }
        ));

        var loginid = req.param("loginid");
        req.session.loginid = loginid;
        passport.authenticate('twitter')(req, res);
    },
    loginf: function (req, res) {
        var user = req.param("user");

        passport.use(new FacebookStrategy({
                clientID: "1616856265259993",
                clientSecret: "6e8052bdbe29f02ead4f618549e98cac",
                callbackURL: sails.myurl + "user/callbackf"
            },
            function (accessToken, refreshToken, profile, done) {
                profile.accessToken = accessToken;
                profile.refreshToken = refreshToken;
                profile.provider = "Facebook";
                if (user && sails.ObjectID.isValid(user)) {
                    profile._id = user;
                }
                User.findorcreate(profile, done);
            }
        ));

        var loginid = req.param("loginid");
        req.session.loginid = loginid;
        passport.authenticate('facebook', {
            scope: 'email,public_profile,user_posts,publish_actions'
        })(req, res);
    },
    callbackt: passport.authenticate('twitter', {
        successRedirect: '/user/success',
        failureRedirect: '/user/fail'
    }),
    callbackf: passport.authenticate('facebook', {
        successRedirect: '/user/success',
        failureRedirect: '/user/fail'
    }),
    success: function (req, res, data) {
        if (req.session.passport) {
            sails.sockets.blast("login", {
                loginid: req.session.loginid,
                status: "success",
                user: req.session.passport.user
            });
        }
        res.view("success");
    },
    fail: function (req, res) {
        sails.sockets.blast("login", {
            loginid: req.session.loginid,
            status: "fail"
        });
        res.view("fail");
    },
    profile: function (req, res) {
        if (req.session.passport) {
            res.json(req.session.passport.user);
        } else {
            res.json({});
        }
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
        if (!userid || userid == "" || !sails.ObjectID.isValid(userid)) {
            return res.badRequest();
        } else {
            function showjson(err, data) {
                if (err) {
                    res.json(err);
                } else {
                    Post.save(data, function (response) {
                        res.json(response);
                    });
                }
            };
            User.facebookpost(userid, message, link, showjson);
        }
    },
    twitterPost: function (req, res) {

        var galleryid = req.param("galleryid");
        var userid = req.param("userid");
        var message = sails.myurl + galleryid;

        if (!userid || userid == "" || !sails.ObjectID.isValid(userid)) {
            return res.badRequest();
        } else {
            function showjson(err, data) {
                if (err) {
                    res.json(err);
                } else {
                    Post.save(data, function (response) {
                        res.json(response);
                    });
                }
            };
            User.twitterpost(userid, message, showjson);
        }
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

    redirect: function (req, res) {
        res.redirect(307, 'http://www.timesbappa.com');
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
                    title: "Times Bappa - Ganpati Bappa Morya!",
                    image: sails.myurl + "uploadfile/getuserimage?file=" + data2,
                    description: "Ganpati Bappa Morya! I’ve created a lovely Ganesh idol using Times BAPPA app. Offer likes to my Bappa and create your own here: http://www.timesbappa.com"
                };
                res.view("card", data);
            });
        }

    },

    tracker: function (req, res) {

        var responsenum = 0;
        var checkres = 0;
        var completeresponse = [];

        function trackstartsnow(trackarr) {
            _.each(trackarr, function (n, key1) {
                if (n.post && n.post[0]) {
                    responsenum += n.post.length;
                    _.each(n.post, function (m, key2) {
                        if (m.provider == "twitter") {
                            User.twitterPostDetail(m.id_str, n._id, n.token, n.tokenSecret, showjson);
                        } else {
                            User.facebookPostDetail(m.id, n._id,n.accessToken, showjson);
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
                    checkres++;
                    completeresponse.push(response);
                    if (checkres == responsenum) {
                        res.json(completeresponse);
                    }
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

                res.json({
                    value: "false"
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
                        $or: [{
                            "post.creationtime": date
            }]

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
        }, {
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
        }, {
                    $unwind: "$name"
        }, {
                    $unwind: "$profilepic"
        }, {
                    $sort: {
                        total: -1,
                        like: -1,
                        retweet: -1,
                        favorite: -1,
                        name: 1
                    }
        }]).toArray(function (err, data2) {

                    if (err) {
                        res.json({
                            value: "false"
                        });
                    } else if (data2 && data2[0]) {
                        var dailypost = {};
                        dailypost.leaderboard = data2;
                        dailypost.date = date;
                        dailypost.type = "DailyPost";
                        DailyPost.save(dailypost, function (response) {
                            res.json(dailypost);
                        });
                    }

                });
            }
        });
    },

    date3leaderboard: function (req, res) {

        var count = {};
        var postdata = {};
        postdata.count = [];
        sails.query(function (err, db) {
            if (err) {
                console.log(err);

                res.json({
                    value: "false"
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
                        $or: [{
                            "post.creationtime": "17-09-2015"
            }, {
                            "post.creationtime": '18-09-2015'
            }, {
                            "post.creationtime": '19-09-2015'
            }]

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
        }, {
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
        }, {
                    $unwind: "$name"
        }, {
                    $unwind: "$profilepic"
        }, {
                    $sort: {
                        total: -1,
                        like: -1,
                        retweet: -1,
                        favorite: -1,
                        name: 1
                    }
        }]).toArray(function (err, data2) {

                    if (err) {
                        res.json({
                            value: "false"
                        });
                    }
                    if (data2 != null) {
                        var dailypost = {};
                        dailypost.leaderboard = data2;
                        dailypost.type = "ThreeDays"
                        DailyPost.save(dailypost, function (response) {
                            res.json(dailypost);
                        });
                    }

                });
            }
        });
    },

    date5leaderboard: function (req, res) {

        var count = {};
        var postdata = {};
        postdata.count = [];
        sails.query(function (err, db) {
            if (err) {
                console.log(err);

                res.json({
                    value: "false"
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
                        $or: [{
                            "post.creationtime": "17-09-2015"
            }, {
                            "post.creationtime": '18-09-2015'
            }, {
                            "post.creationtime": '19-09-2015'
            }, {
                            "post.creationtime": "20-09-2015"
            }, {
                            "post.creationtime": '21-09-2015'
            }]

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
        }, {
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
        }, {
                    $unwind: "$name"
        }, {
                    $unwind: "$profilepic"
        }, {
                    $sort: {
                        total: -1,
                        like: -1,
                        retweet: -1,
                        favorite: -1,
                        name: 1
                    }
        }]).toArray(function (err, data2) {

                    if (err) {
                        res.json({
                            value: "false"
                        });
                    }
                    if (data2 != null) {
                        var dailypost = {};
                        dailypost.leaderboard = data2;

                        dailypost.type = "FiveDays";
                        DailyPost.save(dailypost, function (response) {
                            res.json(dailypost);
                        });
                    }

                });
            }
        });
    },

    date10leaderboard: function (req, res) {
        var count = {};
        var postdata = {};
        postdata.count = [];
        sails.query(function (err, db) {
            if (err) {
                console.log(err);

                res.json({
                    value: "false"
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
                        $or: [{
                            "post.creationtime": "17-09-2015"
            }, {
                            "post.creationtime": '18-09-2015'
            }, {
                            "post.creationtime": '19-09-2015'
            }, {
                            "post.creationtime": "20-09-2015"
            }, {
                            "post.creationtime": '21-09-2015'
            }, {
                            "post.creationtime": '22-09-2015'
            }, {
                            "post.creationtime": "23-09-2015"
            }, {
                            "post.creationtime": '24-09-2015'
            }, {
                            "post.creationtime": '25-09-2015'
            }, {
                            "post.creationtime": "26-09-2015"
            }]

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
        }, {
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
        }, {
                    $unwind: "$name"
        }, {
                    $unwind: "$profilepic"
        }, {
                    $sort: {
                        total: -1,
                        like: -1,
                        retweet: -1,
                        favorite: -1,
                        name: 1
                    }
        }]).toArray(function (err, data2) {

                    if (err) {
                        res.json({
                            value: "false"
                        });
                    }
                    if (data2 != null) {
                        var dailypost = {};
                        dailypost.leaderboard = data2;
                        dailypost.type = "TenDays";

                        DailyPost.save(dailypost, function (response) {
                            res.json(dailypost);
                        });
                    }
                });
            }
        });
    },
    readyLeaderboard: function (req, res) {

            var response = [];
            res.connection.setTimeout(200000);
            req.connection.setTimeout(200000);

            function rescallback() {
                if (response.length == 5) {
                    res.json(response);
                }
            }

            request.get({
                url: sails.myurl + "user/tracker"
            }, function (err, httpResponse, body) {
                if (err) {
                    console.log(err);
                } else {
                    response.push({
                        tracker: JSON.parse(body)
                    });
                    request.get({
                        url: sails.myurl + "user/getdailypost?date=" + sails.moment().format('DD-MM-YYYY')
                    }, function (err, httpResponse, body) {
                        console.log(err);
                        response.push({
                            dailyleader: JSON.parse(body)
                        });
                        rescallback();
                    });
                    request.get({
                        url: sails.myurl + "user/date3leaderboard"
                    }, function (err, httpResponse, body) {
                        console.log(err);
                        response.push({
                            threeleader: JSON.parse(body)
                        });
                        rescallback();
                    });
                    request.get({
                        url: sails.myurl + "user/date5leaderboard"
                    }, function (err, httpResponse, body) {
                        console.log(err);
                        response.push({
                            fiveleader: JSON.parse(body)
                        });
                        rescallback();
                    });
                    request.get({
                        url: sails.myurl + "user/date10leaderboard"
                    }, function (err, httpResponse, body) {
                        console.log(err);
                        response.push({
                            tenleader: JSON.parse(body)
                        });
                        rescallback();
                    });

                }
            });
        }
        /////////////////////////////////////
};