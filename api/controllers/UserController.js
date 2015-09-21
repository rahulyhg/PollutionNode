var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;


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
        User.findorcreate(profile, done);
    }
));

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
var geoip = require('geoip-lite');
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
    countusers: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.countusers(req.body, print);
    },
    findlimited: function (req, res) {

        var print = function (data) {
            res.json(data);
        }
        User.findlimited(req.body, print);
    },
    ip: function (req, res) {

        var ip = req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(":") + 1);
        request.get({
            url: "http://api.db-ip.com/addrinfo?addr=" + ip + "&api_key=a5a4e8f10fb5783e10f790a5de7f5f892bf15188"
        }, function (err, httpResponse, body) {
            res.json(JSON.parse(body));
        });
    },
    findone: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.findone(req.body, print);
    },
    updatecity: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.updatecity(req.body, print);
    },
    trimcity: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.trimcity(req.body, print);
    },
    distinctcity: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        User.distinctcity(req.body, print);
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
            scope: 'email,public_profile,publish_actions'
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

        function ipsavecallback() {
            if (req.session.passport) {
                sails.sockets.blast("login", {
                    loginid: req.session.loginid,
                    status: "success",
                    user: req.session.passport.user
                });
            }
            res.view("success");
        }

        var ip = req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(":") + 1);
        request.get({
            url: "http://api.db-ip.com/addrinfo?addr=" + ip + "&api_key=a5a4e8f10fb5783e10f790a5de7f5f892bf15188"
        }, function (err, httpResponse, body) {
            var userobj = {};
            userobj._id = req.session.passport.user.id;
            body = JSON.parse(body);
            var splitcity = body.city.split("(");
            userobj.city = splitcity[0].trim();
            userEdit(userobj);

            function userEdit(userobj) {
                User.editcity(userobj, ipsavecallback);
            }
        });
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
                            User.facebookPostDetail(m.id, n._id, n.accessToken, showjson);
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
                        share: {
                            $sum: '$post.total_shares'
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        city: {
                            $addToSet: "$city"
                        }
                    }
        }, {
                    $project: {
                        _id: 1,
                        retweet: 1,
                        favorite: 1,
                        like: 1,
                        share: 1,
                        name: 1,
                        city: 1,
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
                    $unwind: "$city"
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
                        $match: {
                            "days": 3
                        }
                },
                    {
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
                            share: {
                                $sum: '$post.total_shares'
                            },
                            name: {
                                $addToSet: "$name"
                            },
                            profilepic: {
                                $addToSet: "$profilepic"
                            },
                            city: {
                                $addToSet: "$city"
                            }
                        }
        }, {
                        $project: {
                            _id: 1,
                            retweet: 1,
                            favorite: 1,
                            like: 1,
                            share: 1,
                            name: 1,
                            city: 1,
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
                        $unwind: "$city"
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
                    $match: {
                        "days": 5
                    }
                }, {
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
                        share: {
                            $sum: '$post.total_shares'
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        city: {
                            $addToSet: "$city"
                        }
                    }
        }, {
                    $project: {
                        _id: 1,
                        retweet: 1,
                        favorite: 1,
                        like: 1,
                        share: 1,
                        name: 1,
                        city: 1,
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
                    $unwind: "$city"
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
                    $match: {
                        $or: [{
                            days: 10
                        }, {
                            days: 1
                        }]
                    }
                }, {
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
                        share: {
                            $sum: '$post.total_shares'
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        city: {
                            $addToSet: "$city"
                        }
                    }
        }, {
                    $project: {
                        _id: 1,
                        retweet: 1,
                        favorite: 1,
                        like: 1,
                        share: 1,
                        name: 1,
                        city: 1,
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
                    $unwind: "$city"
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
    counter: function (req, res) {
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
                    $group: {
                        _id: null,
                        retweet: {
                            $sum: '$post.retweet_count'
                        },
                        favorite: {
                            $sum: '$post.favorite_count'
                        },
                        like: {
                            $sum: '$post.total_likes'
                        },
                        share: {
                            $sum: '$post.total_shares'
                        }
                    }
            }, {
                    $project: {
                        _id: 0,
                        retweet: 1,
                        favorite: 1,
                        like: 1,
                        share: 1,
                        total: {
                            $add: ["$like", "$retweet", "$favorite", "$share"]
                        }
                    }
        }]).toArray(function (err, data2) {

                    if (err) {
                        res.json({
                            value: "false"
                        });
                    } else if (data2 && data2[0]) {
                        res.json(data2[0]);
                    } else {
                        res.json({
                            "retweet": 0,
                            "favorite": 0,
                            "like": 0,
                            "share": 0,
                            "total": 0
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
    },
    currentTime: function (req, res) {
        res.json(sails.moment().format('DD-MM-YYYY h-mm-ss-SSSSa'));
    },
    mumFavorite: function (req, res) {
        var date = req.param("date");
        var i = 0;
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                res.json({
                    value: "false"
                });
            } else if (db) {
                db.collection("user").aggregate([{
                    $match: {
                        $or: [{
                            city: "Andheri"
                            }, {
                            city: "Mira Bhayandar"
                            }, {
                            city: "Bhiwandi"
                            }, {
                            city: "Dombivli"
                            }, {
                            city: "Kalyan-Dombivili"
                            }, {
                            city: "Mumbai"
                            }, {
                            city: "Navi Mumbai"
                            }, {
                            city: "Thane"
                            }, {
                            city: "Vasai Virar"
                            }, {
                            city: "Vikhroli West"
                            }]
                    }
                }, {
                    $unwind: "$post"
                }, {
                    $match: {
                        "post.creationtime": date
                    }
                }, {
                    $group: {
                        _id: "$_id",
                        city: {
                            $addToSet: "$city"
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        favorite: {
                            $sum: '$post.favorite_count'
                        },
                        like: {
                            $sum: '$post.total_likes'
                        }
                    }
                }, {
                    $project: {
                        _id: 1,
                        city: 1,
                        name: 1,
                        profilepic: 1,
                        addedfavorite: {
                            $add: ["$favorite", "$like"]
                        }
                    }
                }, {
                    $unwind: "$city"
                }, {
                    $unwind: "$name"
                }, {
                    $unwind: "$profilepic"
                }, {
                    $sort: {
                        addedfavorite: -1
                    }
                }]).toArray(function (err, data2) {
                    if (err) {
                        console.log(err);
                        db.close();
                    } else if (data2 && data2[0]) {
                        _.each(data2, function (n) {
                            db.collection('user').find({
                                _id: n._id
                            }, {
                                "gallery": 1
                            }).toArray(function (err, galdata) {
                                if (err) {
                                    i++;
                                    console.log(err);
                                } else if (galdata && galdata[0] && galdata[0].gallery && galdata[0].gallery[galdata[0].gallery.length - 1]) {
                                    n.galimage = galdata[0].gallery[galdata[0].gallery.length - 1].imagefinal;
                                    i++;
                                    if (i == data2.length) {
                                        res.json(data2);
                                    }
                                } else {
                                    i++;
                                }
                            });
                        });
                    }
                });
            }
        });
    },
    mumShare: function (req, res) {
        var date = req.param("date");
        var i = 0;
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                res.json({
                    value: "false"
                });
            } else if (db) {
                db.collection("user").aggregate([{
                    $match: {
                        $or: [{
                            city: "Andheri"
                            }, {
                            city: "Mira Bhayandar"
                            }, {
                            city: "Bhiwandi"
                            }, {
                            city: "Dombivli"
                            }, {
                            city: "Kalyan-Dombivili"
                            }, {
                            city: "Mumbai"
                            }, {
                            city: "Navi Mumbai"
                            }, {
                            city: "Thane"
                            }, {
                            city: "Vasai Virar"
                            }, {
                            city: "Vikhroli West"
                            }]
                    }
                }, {
                    $unwind: "$post"
                }, {
                    $match: {
                        "post.creationtime": date
                    }
                }, {
                    $group: {
                        _id: "$_id",
                        city: {
                            $addToSet: "$city"
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        retweet: {
                            $sum: '$post.retweet_count'
                        },
                        share: {
                            $sum: '$post.total_shares'
                        },
                    }
                }, {
                    $project: {
                        _id: 1,
                        city: 1,
                        name: 1,
                        profilepic: 1,
                        addedshare: {
                            $add: ["$retweet", "$share"]
                        }
                    }
                }, {
                    $unwind: "$city"
                }, {
                    $unwind: "$name"
                }, {
                    $unwind: "$profilepic"
                }, {
                    $sort: {
                        addedshare: -1
                    }
                }]).toArray(function (err, data2) {
                    if (err) {
                        console.log(err);
                        db.close();
                    } else if (data2 && data2[0]) {
                        _.each(data2, function (n) {
                            db.collection('user').find({
                                _id: n._id
                            }, {
                                "gallery": 1
                            }).toArray(function (err, galdata) {
                                if (err) {
                                    i++;
                                    console.log(err);
                                } else if (galdata && galdata[0] && galdata[0].gallery && galdata[0].gallery[galdata[0].gallery.length - 1]) {
                                    n.galimage = galdata[0].gallery[galdata[0].gallery.length - 1].imagefinal;
                                    i++;
                                    if (i == data2.length) {
                                        res.json(data2);
                                    }
                                } else {
                                    i++;
                                }
                            });
                        });
                    }
                });
            }
        });
    },
    puneFavorite: function (req, res) {
        var date = req.param("date");
        var i = 0;
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                res.json({
                    value: "false"
                });
            } else if (db) {
                db.collection("user").aggregate([{
                    $match: {
                        $or: [{
                            city: "Pune"
                            }, {
                            city: "Pimpri-Chinchwad"
                            }]
                    }
                }, {
                    $unwind: "$post"
                }, {
                    $match: {
                        "post.creationtime": date
                    }
                }, {
                    $group: {
                        _id: "$_id",
                        city: {
                            $addToSet: "$city"
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        favorite: {
                            $sum: '$post.favorite_count'
                        },
                        like: {
                            $sum: '$post.total_likes'
                        }
                    }
                }, {
                    $project: {
                        _id: 1,
                        city: 1,
                        name: 1,
                        profilepic: 1,
                        addedfavorite: {
                            $add: ["$favorite", "$like"]
                        }
                    }
                }, {
                    $unwind: "$city"
                }, {
                    $unwind: "$name"
                }, {
                    $unwind: "$profilepic"
                }, {
                    $sort: {
                        addedfavorite: -1
                    }
                }]).toArray(function (err, data2) {
                    if (err) {
                        console.log(err);
                        db.close();
                    } else if (data2 && data2[0]) {
                        _.each(data2, function (n) {
                            db.collection('user').find({
                                _id: n._id
                            }, {
                                "gallery": 1
                            }).toArray(function (err, galdata) {
                                if (err) {
                                    i++;
                                    console.log(err);
                                } else if (galdata && galdata[0] && galdata[0].gallery && galdata[0].gallery[galdata[0].gallery.length - 1]) {
                                    n.galimage = galdata[0].gallery[galdata[0].gallery.length - 1].imagefinal;
                                    i++;
                                    if (i == data2.length) {
                                        res.json(data2);
                                    }
                                } else {
                                    i++;
                                }
                            });
                        });
                    }
                });
            }
        });
    },
    puneShare: function (req, res) {
        var date = req.param("date");
        var i = 0;
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                res.json({
                    value: "false"
                });
            } else if (db) {
                db.collection("user").aggregate([{
                    $match: {
                        $or: [{
                            city: "Pune"
                            }, {
                            city: "Pimpri-Chinchwad"
                            }]
                    }
                }, {
                    $unwind: "$post"
                }, {
                    $match: {
                        "post.creationtime": date
                    }
                }, {
                    $group: {
                        _id: "$_id",
                        city: {
                            $addToSet: "$city"
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        retweet: {
                            $sum: '$post.retweet_count'
                        },
                        share: {
                            $sum: '$post.total_shares'
                        },
                    }
                }, {
                    $project: {
                        _id: 1,
                        city: 1,
                        name: 1,
                        profilepic: 1,
                        addedshare: {
                            $add: ["$retweet", "$share"]
                        }
                    }
                }, {
                    $unwind: "$city"
                }, {
                    $unwind: "$name"
                }, {
                    $unwind: "$profilepic"
                }, {
                    $sort: {
                        addedshare: -1
                    }
                }]).toArray(function (err, data2) {
                    if (err) {
                        console.log(err);
                        db.close();
                    } else if (data2 && data2[0]) {
                        _.each(data2, function (n) {
                            db.collection('user').find({
                                _id: n._id
                            }, {
                                "gallery": 1
                            }).toArray(function (err, galdata) {
                                if (err) {
                                    i++;
                                    console.log(err);
                                } else if (galdata && galdata[0] && galdata[0].gallery && galdata[0].gallery[galdata[0].gallery.length - 1]) {
                                    n.galimage = galdata[0].gallery[galdata[0].gallery.length - 1].imagefinal;
                                    i++;
                                    if (i == data2.length) {
                                        res.json(data2);
                                    }
                                } else {
                                    i++;
                                }
                            });
                        });
                    }
                });
            }
        });
    },
    jsonToExcel: function (req, res) {
        var i = 0;
        var date = req.param("date");
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
                        "post.creationtime": date
                    }
        }, {
                    $unwind: "$gallery"
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
                        share: {
                            $sum: '$post.total_shares'
                        },
                        fbid: {
                            $last: "$fbid"
                        },
                        tweetid: {
                            $last: "$tweetid"
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        city: {
                            $addToSet: "$city"
                        },
                        ganpatiImage: {
                            $last: "$gallery.imagefinal"
                        }
                    }
        }, {
                    $project: {
                        _id: 0,
                        retweet: 1,
                        favorite: 1,
                        like: 1,
                        share: 1,
                        name: 1,
                        fbprofile: {
                            $concat: ["http://www.facebook.com/", "$fbid"]
                        },
                        tweetid: 1,
                        city: 1,
                        profilepic: 1,
                        ganpatiImage1: {
                            $concat: ["http://timesbappa.com/uploadfile/getuserimage?file=", "$ganpatiImage"]
                        },
                        favoriteandlike: {
                            $add: ["$like", "$favorite"]
                        },
                        shareandretweet: {
                            $add: ["$retweet", "$share"]
                        }
                    }
        }, {
                    $unwind: "$name"
        }, {
                    $unwind: "$profilepic"
        }, {
                    $unwind: "$city"
        }]).toArray(function (err, data2) {
                    if (err) {
                        res.json({
                            value: "false"
                        });
                    } else if (data2 && data2[0]) {
                        createExcel(data2);

                        function createExcel(json) {
                            var xls = sails.json2xls(json);
                            sails.fs.writeFileSync('./data.xlsx', xls, 'binary');
                            var excel = sails.fs.readFileSync('./data.xlsx');
                            var mimetype = sails.mime.lookup('./data.xlsx');
                            res.set('Content-Type', mimetype);
                            res.send(excel);
                        }
                    }
                });
            }
        });
    },
    day3excel: function (req, res) {
        var i = 0;
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                res.json({
                    value: "false"
                });
            }
            if (db) {
                db.collection("user").aggregate([{
                    $match: {
                        days: 3
                    }
        }, {
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
                    $unwind: "$gallery"
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
                        share: {
                            $sum: '$post.total_shares'
                        },
                        fbid: {
                            $last: "$fbid"
                        },
                        tweetid: {
                            $last: "$tweetid"
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        city: {
                            $addToSet: "$city"
                        },
                        ganpatiImage: {
                            $last: "$gallery.imagefinal"
                        }
                    }
        }, {
                    $project: {
                        _id: 0,
                        retweet: 1,
                        favorite: 1,
                        like: 1,
                        share: 1,
                        name: 1,
                        fbprofile: {
                            $concat: ["http://www.facebook.com/", "$fbid"]
                        },
                        tweetid: 1,
                        city: 1,
                        profilepic: 1,
                        ganpatiImage1: {
                            $concat: ["http://timesbappa.com/uploadfile/getuserimage?file=", "$ganpatiImage"]
                        },
                        favoriteandlike: {
                            $add: ["$like", "$favorite"]
                        },
                        shareandretweet: {
                            $add: ["$retweet", "$share"]
                        }
                    }
        }, {
                    $unwind: "$name"
        }, {
                    $unwind: "$profilepic"
        }, {
                    $unwind: "$city"
        }]).toArray(function (err, data2) {
                    if (err) {
                        res.json({
                            value: "false"
                        });
                    } else if (data2 && data2[0]) {
                        createExcel(data2);

                        function createExcel(json) {
                            var xls = sails.json2xls(json);
                            sails.fs.writeFileSync('./data.xlsx', xls, 'binary');
                            var excel = sails.fs.readFileSync('./data.xlsx');
                            var mimetype = sails.mime.lookup('./data.xlsx');
                            res.set('Content-Type', mimetype);
                            res.send(excel);
                        }
                    }
                });
            }
        });
    },
    day5excel: function (req, res) {
        var i = 0;
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                res.json({
                    value: "false"
                });
            }
            if (db) {
                db.collection("user").aggregate([{
                    $match: {
                        days: 5
                    }
        }, {
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
                            "post.creationtime": '20-09-2015'
            }, {
                            "post.creationtime": '21-09-2015'
            }]
                    }
        }, {
                    $unwind: "$gallery"
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
                        share: {
                            $sum: '$post.total_shares'
                        },
                        fbid: {
                            $last: "$fbid"
                        },
                        tweetid: {
                            $last: "$tweetid"
                        },
                        name: {
                            $addToSet: "$name"
                        },
                        profilepic: {
                            $addToSet: "$profilepic"
                        },
                        city: {
                            $addToSet: "$city"
                        },
                        ganpatiImage: {
                            $last: "$gallery.imagefinal"
                        }
                    }
        }, {
                    $project: {
                        _id: 0,
                        retweet: 1,
                        favorite: 1,
                        like: 1,
                        share: 1,
                        name: 1,
                        fbprofile: {
                            $concat: ["http://www.facebook.com/", "$fbid"]
                        },
                        tweetid: 1,
                        city: 1,
                        profilepic: 1,
                        ganpatiImage1: {
                            $concat: ["http://timesbappa.com/uploadfile/getuserimage?file=", "$ganpatiImage"]
                        },
                        favoriteandlike: {
                            $add: ["$like", "$favorite"]
                        },
                        shareandretweet: {
                            $add: ["$retweet", "$share"]
                        }
                    }
        }, {
                    $unwind: "$name"
        }, {
                    $unwind: "$profilepic"
        }, {
                    $unwind: "$city"
        }]).toArray(function (err, data2) {
                    if (err) {
                        res.json({
                            value: "false"
                        });
                    } else if (data2 && data2[0]) {
                        createExcel(data2);

                        function createExcel(json) {
                            var xls = sails.json2xls(json);
                            sails.fs.writeFileSync('./data.xlsx', xls, 'binary');
                            var excel = sails.fs.readFileSync('./data.xlsx');
                            var mimetype = sails.mime.lookup('./data.xlsx');
                            res.set('Content-Type', mimetype);
                            res.send(excel);
                        }
                    }
                });
            }
        });
    },
    day10excel: function (req, res) {
            var i = 0;
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                    res.json({
                        value: "false"
                    });
                }
                if (db) {
                    db.collection("user").aggregate([{
                        $match: {
                            $or: [{
                                days: 10
                            }, {
                                days: 1
                            }]
                        }
        }, {
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
                                "post.creationtime": '20-09-2015'
            }, {
                                "post.creationtime": '21-09-2015'
            }, {
                                "post.creationtime": '22-09-2015'
            }, {
                                "post.creationtime": '23-09-2015'
            }, {
                                "post.creationtime": '24-09-2015'
            }, {
                                "post.creationtime": '25-09-2015'
            }, {
                                "post.creationtime": '26-09-2015'
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
                            share: {
                                $sum: '$post.total_shares'
                            },
                            fbid: {
                                $last: "$fbid"
                            },
                            tweetid: {
                                $last: "$tweetid"
                            },
                            name: {
                                $addToSet: "$name"
                            },
                            profilepic: {
                                $addToSet: "$profilepic"
                            },
                            city: {
                                $addToSet: "$city"
                            }
                        }
        }, {
                        $project: {
                            _id: 0,
                            retweet: 1,
                            favorite: 1,
                            like: 1,
                            share: 1,
                            name: 1,
                            fbprofile: {
                                $concat: ["http://www.facebook.com/", "$fbid"]
                            },
                            tweetid: 1,
                            city: 1,
                            profilepic: 1,
                            favoriteandlike: {
                                $add: ["$like", "$favorite"]
                            },
                            shareandretweet: {
                                $add: ["$retweet", "$share"]
                            }
                        }
        }, {
                        $unwind: "$name"
        }, {
                        $unwind: "$profilepic"
        }, {
                        $unwind: "$city"
        }]).toArray(function (err, data2) {
                        if (err) {
                            res.json({
                                value: "false"
                            });
                        } else if (data2 && data2[0]) {
                            createExcel(data2);

                            function createExcel(json) {
                                var xls = sails.json2xls(json);
                                sails.fs.writeFileSync('./data.xlsx', xls, 'binary');
                                var excel = sails.fs.readFileSync('./data.xlsx');
                                var mimetype = sails.mime.lookup('./data.xlsx');
                                res.set('Content-Type', mimetype);
                                res.send(excel);
                            }
                        }
                    });
                }
            });
        }
        /////////////////////////////////////
};