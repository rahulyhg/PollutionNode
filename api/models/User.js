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
                var dummy = sails.ObjectID();
                data.modificationtime = dummy.getTimestamp();
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
                db.collection('user').find({}).each(function (err, found) {
                    if (err) {
                        callback({
                            value: false
                        });
                    }
                    if (found != null) {
                        returns.push(found);
                    } else {
                        if (found == null) {
                            callback(returns);
                        }
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
                db.collection("user").find({
                    "_id": sails.ObjectID(data._id)
                }).each(function (err, data) {
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                    }
                    if (data != null) {
                        callback(data);
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
        if (data.provider == "Twitter") {
            insertdata.tweetid = data.id;
            insertdata.fbid = '';
            insertdata.provider = data.provider;
            insertdata.username = data.username;
            insertdata.name = data.displayName;
            insertdata.profilepic = data.photos[0].value;
            insertdata.token = data.token;
            insertdata.tokenSecret = data.tokenSecret;
            orfunc.tweetid = data.id;
            dbcall(insertdata);
        } else {
            insertdata.tweetid = '';
            insertdata.fbid = data.id;
            insertdata.provider = data.provider;
            insertdata.username = data.username;
            insertdata.name = data.displayName;
            insertdata.profilepic = data.photos[0].value;
            insertdata.email = data.emails[0].value;
            insertdata.accessToken = data.accessToken;
            insertdata.refreshToken = data.refreshToken;
            orfunc.fbid = data.id;
            dbcall(insertdata);
        }

        function dbcall(dbdata) {
            sails.query(function (err, db) {
                if (err) {
                    return
                }
                if (db) {
                    db.collection('user').findAndRemove(orfunc, function (err, removed) {
                        if (err) {
                            callback(err);
                        }
                        if (removed) {
                            db.collection('user').insert(dbdata, function (err, created) {
                                insertdata = {};
                                if (err) {
                                    callback(err);
                                }
                                if (created) {
                                    callback(null, {
                                        value: "true"
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    },
    twitterpost: function (userid, message, callback) {

        var Twitter = new Twit({
            consumer_key: "6gOb3JlMDgqYw27fLN29l5Vmp",
            consumer_secret: "kEF99DQQssEZGJnJXvIBVTjuAs2vt1R8wji2OQ9nOc0fhlcVKM",
            access_token: access_token,
            access_token_secret: access_token_secret
        })

        Twitter.post('statuses/update', {
            status: message
        }, function (err, data, response) {
            callback(err, data);
        });
    },
    facebookpost: function (userid, message, link, callback) {
        request.post({
            url: 'https://graph.facebook.com/v2.4/' + userfbid + '/feed',
            form: {
                access_token: "1616856265259993|HjeOYsxGLpafWdZ89YGQwu9L0Xs",
                message: message,
                link: link
            }
        }, function (err, httpResponse, body) {
            callback(err, JSON.parse(body));
        });
    },
    twitterPostDetail: function (postid, message, link, callback) {
        var Twitter = new Twit({
            consumer_key: "6gOb3JlMDgqYw27fLN29l5Vmp",
            consumer_secret: "kEF99DQQssEZGJnJXvIBVTjuAs2vt1R8wji2OQ9nOc0fhlcVKM",
            access_token: access_token,
            access_token_secret: access_token_secret
        })

        Twitter.get('statuses/show/'+postid, {
            status: message
        }, function (err, data, response) {
            callback(err, data);
        });
    },
    facebookPostDetail: function (userid, message, link, callback) {
        request.get({
            url: 'https://graph.facebook.com/v2.4/' + postid + "/likes?summary=true" ,
            form: {
                access_token: "1616856265259993|HjeOYsxGLpafWdZ89YGQwu9L0Xs"
            }
        }, function (err, httpResponse, body) {
            callback(err, JSON.parse(body));
        });
    },
    
    

};