var insertdata = {};
var request = require('request');
var Twit = require('twit')

module.exports = {
    save: function (data, callback) {
        if (!data._id) {
            data._id = sails.ObjectID();
            if (!data.creationtime) {
                data.creationtime = data._id.getTimestamp();
            }
            data.modificationtime = data.creationtime;
            sails.query(function (err, db) {
                db.collection('user').insert(data, function (err, created) {
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                    }
                    if (created) {
                        callback({
                            value: true
                        });
                    }
                });
            });
        } else {
            sails.query(function (err, db) {
                var user = data._id;
                delete data._id;
                db.collection('user').update({
                    "_id": sails.ObjectID(user)
                }, {
                    $set: data
                }, function (err, updated) {
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                    }
                    if (updated) {
                        callback({
                            value: true
                        });
                    }
                });
            });
        }
    },
    countusers: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").count({}, function (err, number) {
                    if (number != null) {
                        callback(number);
                        db.close();
                    } else if (err) {
                        callback({
                            value: false
                        });
                        db.close();
                    } else {
                        callback({
                            value: false,
                            comment: "No user found."
                        });
                        db.close();
                    }
                });
            }
        });
    },
    find: function (data, callback) {
        var returns = [];
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('user').find({}).toArray(function (err, found) {
                    if (err) {
                        callback({
                            value: false
                        });
                    }
                    if (found != null) {
                        callback(found);
                    }
                });
            }
        });
    },
    //Findlimited
    findlimited: function (data, callback) {
        var newcallback = 0;
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        var pagesize = parseInt(data.pagesize);
        var pagenumber = parseInt(data.pagenumber);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").count({
                    name: {
                        '$regex': check
                    }
                }, function (err, number) {
                    newreturns.total = number;
                    newreturns.totalpages = Math.ceil(number / data.pagesize);
                    newcallback++;
                    if (newcallback == 2) {
                        callback(newreturns);
                    }

                });
                db.collection("user").find({
                    name: {
                        '$regex': check
                    }
                }, {
                    $orderby: {
                        _id: -1
                    }
                }).skip(pagesize * (pagenumber - 1)).limit(pagesize).each(function (err, found) {
                    if (err) {
                        callback({
                            value: false
                        });
                        console.log(err);
                    }
                    if (found != null) {
                        newreturns.data.push(found);
                    } else {
                        if (found == null) {
                            newcallback++;
                            if (newcallback == 2) {
                                callback(newreturns);
                            }
                        }
                    }
                });
            }
        });
    },
    //Findlimited
    findone: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                if (sails.ObjectID.isValid(data._id)) {
                    db.collection("user").find({
                        "_id": sails.ObjectID(data._id)
                    }).each(function (err, data) {
                        if (err) {
                            console.log(err);
                            callback({
                                value: false
                            });
                        } else if (data != null) {
                            callback(data);
                        } else {
                            console.log(err);
                            callback({
                                value: false
                            });
                        }
                    });
                }
            }
        });
    },
    getOneUser: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({
                    "_id": sails.ObjectID(data)
                }, {
                    _id: 1,
                    fbid: 1,
                    tweetid: 1,
                    name: 1,
                    profilepic: 1,
                    days: 1,
                    balancedate: 1,
                    viserjan: 1
                }).toArray(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                    } else if (data && data[0]) {
                        callback(data[0]);
                    } else {
                        callback({
                            value: false,
                            comment: "NO SUCH USER"
                        });
                    }
                });
            }
        });
    },
    delete: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            db.collection('user').remove({
                _id: sails.ObjectID(data._id)
            }, function (err, deleted) {
                if (deleted) {
                    callback({
                        value: true
                    });
                }
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });
                }
            });
        });
    },
    findorcreate: function (data, callback) {
        var orfunc = {};
        var insertdata = {};
        var updatedata = {
            _id: data._id
        };
        if (data.provider == "Twitter") {
            updatedata.tweetid = data.id;
            updatedata.token = data.token;
            updatedata.tokenSecret = data.tokenSecret;

            insertdata.tweetid = data.id;
            insertdata.provider = data.provider;
            insertdata.username = data.username;
            insertdata.name = data.displayName;
            if (data.photos[0]) {
                insertdata.profilepic = data.photos[0].value;
            }
            insertdata.token = data.token;
            insertdata.tokenSecret = data.tokenSecret;
            orfunc.tweetid = data.id;
            dbcall(insertdata, updatedata);
        } else {
            updatedata.fbid = data.id;
            updatedata.accessToken = data.accessToken;
            updatedata.refreshToken = data.refreshToken;

            insertdata.fbid = data.id;
            insertdata.provider = data.provider;
            insertdata.username = data.username;
            insertdata.name = data.displayName;
            if (data.photos && data.photos[0]) {
                insertdata.profilepic = data.photos[0].value;
            }
            if (data.emails && data.emails[0]) {
                insertdata.email = data.emails[0].value;
            }
            insertdata.accessToken = data.accessToken;
            insertdata.refreshToken = data.refreshToken;
            orfunc.fbid = data.id;
            dbcall(insertdata, updatedata);
        }

        function dbcall(data, updatedata) {
            sails.query(function (err, db) {
                if (err) {
                    callback({
                        value: false
                    });
                }
                if (!updatedata._id) {
                    data._id = sails.ObjectID();
                    db.collection('user').find(orfunc).toArray(function (err, found) {
                        if (err) {
                            console.log(err);
                        }
                        if (found.length != 0 && found[0]) {
                            var data2 = found[0];
                            data2.id = found[0]._id;
                            delete data2.accessToken;
                            delete data2.token;
                            delete data2.tokenSecret;
                            delete data2.gallery;
                            delete data2.post;
                            callback(null, data2);
                        } else {

                            request.get({
                                url: "https://graph.facebook.com/oauth/access_token?client_id=1616856265259993&client_secret=6e8052bdbe29f02ead4f618549e98cac&grant_type=fb_exchange_token&fb_exchange_token=" + data.accessToken
                            }, function (err, httpResponse, body) {
                                console.log(body);
                                var accesstoken = body.split("&");
                                accesstoken = accesstoken[0].split("=");
                                data.accessToken = accesstoken[1];
                                db.collection('user').insert(data, function (err, created) {
                                    if (err) {
                                        console.log(err);
                                        callback({
                                            value: false
                                        });
                                    }
                                    if (created) {
                                        data.id = created.ops[0]._id;
                                        delete data.accessToken;
                                        delete data.token;
                                        delete data.tokenSecret;
                                        callback(null, data);
                                    }
                                });

                            });


                        }
                    });
                } else {
                    var user = updatedata._id;
                    delete updatedata._id;

                    db.collection('user').update({
                        "_id": sails.ObjectID(user)
                    }, {
                        $set: updatedata
                    }, function (err, updated) {
                        if (err) {
                            console.log(err);
                            callback({
                                value: false
                            });
                        }
                        if (updatedata) {
                            updatedata._id = user;
                            delete updatedata.accessToken;
                            delete updatedata.token;
                            delete updatedata.tokenSecret;
                            callback(null, updated);
                        }
                    });
                }

            });
        }
    },
    twitterpost: function (userid, message, callback) {
        var usertweetid = "";
        var access_token = "";
        var access_token_secret = "";
        userid = sails.ObjectID(userid);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            if (db) {
                db.collection("user").find({
                    _id: userid,
                    "post.creationtime": sails.moment().format('DD-MM-YYYY'),
                    "post.provider": "twitter"
                }).toArray(function (err, data2) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else if (data2.length > 0) {
                        callback({
                            value: false,
                            comment: "wait"
                        });
                    } else {
                        db.collection('user').find({
                            "_id": sails.ObjectID(userid)
                        }).toArray(function (err, result) {
                            if (err) {
                                console.log(err);
                                callback({
                                    value: false
                                });
                            } else if (result.length > 0) {
                                usertweetid = result[0].tweetid;
                                access_token = result[0].token;
                                access_token_secret = result[0].tokenSecret;
                                callrequest(db);
                            } else {
                                callback({
                                    value: false,
                                    comment: "NO SUCH USER"
                                });
                            }
                        });
                    }
                });
            }
        });

        function callrequest(db) {
            var Twitter = new Twit({
                consumer_key: "6gOb3JlMDgqYw27fLN29l5Vmp",
                consumer_secret: "kEF99DQQssEZGJnJXvIBVTjuAs2vt1R8wji2OQ9nOc0fhlcVKM",
                access_token: access_token,
                access_token_secret: access_token_secret
            })

            Twitter.post('statuses/update', {
                status: "I’ve created a lovely Ganesh idol using Times BAPPA app. Offer likes to my Bappa and create your own here: " + message
            }, function (err, data, response) {
                if (data.error) {
                    callback(err, data);
                } else {
                    data.user = userid;
                    data.provider = "twitter";
                    db.close();
                    callback(err, data);
                }
            });
        }
    },
    facebookpost: function (userid, message, link, callback) {
        var userfbid = "";
        userid = sails.ObjectID(userid);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            if (db) {
                db.collection("user").find({
                    _id: userid,
                    "post.creationtime": sails.moment().format('DD-MM-YYYY'),
                    "post.provider": "facebook"
                }).toArray(function (err, data2) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else if (data2.length > 0) {
                        callback({
                            value: false,
                            comment: "wait"
                        });
                    } else {
                        db.collection('user').find({
                            "_id": sails.ObjectID(userid)
                        }).toArray(function (err, result) {
                            if (err) {
                                console.log(err);
                                callback({
                                    value: false
                                });
                            } else if (result.length > 0) {
                                userfbid = result[0].fbid;
                                callrequest(db);
                            } else {
                                callback({
                                    value: false,
                                    comment: "NO SUCH USER"
                                });
                            }
                        });
                    }
                });
            }
        });

        function callrequest(db) {
            request.post({
                url: 'https://graph.facebook.com/v2.4/' + userfbid + '/feed',
                form: {
                    access_token: "1616856265259993|HjeOYsxGLpafWdZ89YGQwu9L0Xs",
                    message: "I’ve created a lovely Ganesh idol using Times BAPPA app. Offer likes to my Bappa and create your own here: " + link,
                    link: link
                }
            }, function (err, httpResponse, body) {
                body = JSON.parse(body);
                if (body.error) {
                    callback(err, body);
                } else {
                    body.fbid = userfbid;
                    body.user = userid;
                    body.provider = "facebook";
                    db.close();
                    callback(err, body);
                }
            });
        }
    },
    twitterPostDetail: function (twitterpostid, userid, access_token, access_token_secret, callback) {
        var Twitter = new Twit({
            consumer_key: "6gOb3JlMDgqYw27fLN29l5Vmp",
            consumer_secret: "kEF99DQQssEZGJnJXvIBVTjuAs2vt1R8wji2OQ9nOc0fhlcVKM",
            access_token: access_token,
            access_token_secret: access_token_secret
        })
        Twitter.get('statuses/show', {
            id: twitterpostid
        }, function (err, data, response) {
            data.user = userid;
            data.provider = "twitter";
            data.id_str = twitterpostid;
            data._id = '';
            callback(err, data);
        });
    },
    facebookPostDetail: function (fbpostid, userid, accessToken, callback) {
        request.get({
            url: 'https://graph.facebook.com/v2.4/' + fbpostid + "?fields=likes.summary(true),shares&access_token=" + accessToken,
        }, function (err, httpResponse, body) {
            console.log(body);
            body = JSON.parse(body);
            body.user = userid;
            body.provider = "facebook";
            body.id = fbpostid;
            body._id = '';
            callback(err, body);
        });
    }
};