module.exports = {
    save: function (data, callback) {

        var user = sails.ObjectID(data.user);
        if (!data._id && data._id != '') {
            data._id = sails.ObjectID();
            data.creationtime = sails.moment().format('DD-MM-YYYY');
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });
                }
                if (db) {
                    db.collection('user').update({
                        _id: user
                    }, {
                        $push: {
                            post: data
                        }
                    }, function (err, updated) {
                        if (err) {
                            console.log(err);
                        }
                        if (updated) {
                            callback({
                                value: true
                            });
                        }
                    });
                }
            });
        } else {
            if (data.provider == "facebook") {
                if (data.summary && data.summary != "") {
                    data.total_likes = data.summary.total_count;
                    delete data.summary;
                    var tobechanged = {};
                    var attribute = "post.$.";
                    _.forIn(data, function (value, key) {
                        tobechanged[attribute + key] = value;
                    });
                    sails.query(function (err, db) {
                        if (err) {
                            console.log(err);
                            callback({
                                value: false
                            });
                        }
                        if (db) {
                            db.collection('user').update({
                                "_id": user,
                                "post.id": data.id
                            }, {
                                $set: tobechanged
                            }, function (err, updated) {
                                if (err) {
                                    console.log(err);
                                }
                                if (updated) {
                                    callback({
                                        value: true
                                    });
                                }
                            });
                        }
                    });
                } else {
                    Post.delete(data, callback);
                }
            } else if (data.provider == "twitter") {
                if (data.retweet_count || data.retweet_count == 0) {
                    var tobechanged = {};
                    var attribute = "post.$.";
                    _.forIn(data, function (value, key) {
                        tobechanged[attribute + key] = value;
                    });
                    sails.query(function (err, db) {
                        if (err) {
                            console.log(err);
                            callback({
                                value: false
                            });
                        }
                        if (db) {
                            db.collection('user').update({
                                "_id": user,
                                "post.id_str": data.id_str
                            }, {
                                $set: tobechanged
                            }, function (err, updated) {
                                if (err) {
                                    console.log(err);
                                }
                                if (updated) {
                                    callback({
                                        value: true
                                    });
                                }
                            });
                        }
                    });
                } else {
                    Post.delete(data, callback);
                }
            }
        }
    },
    delete: function (data, callback) {
        var user = sails.ObjectID(data.user);
        if (data.id && data.id != "") {
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });
                }
                if (db) {

                    db.collection('user').update({
                        "_id": user
                    }, {
                        $pull: {
                            "post": {
                                "id": data.id
                            }
                        }
                    }, function (err, updated) {
                        if (err) {
                            console.log(err);
                        }
                        if (updated) {
                            callback({
                                value: true
                            });
                        }
                    });
                }
            });
        } else if (data.id_str && data.id_str != "") {
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });
                }
                if (db) {

                    db.collection('user').update({
                        "_id": user
                    }, {
                        $pull: {
                            "post": {
                                "id_str": data.id_str
                            }
                        }
                    }, function (err, updated) {
                        if (err) {
                            console.log(err);
                        }
                        if (updated) {
                            callback({
                                value: true
                            });
                        }
                    });
                }
            });
        }
    },
    //Findlimited
    findlimited: function (data, callback) {
        var newcallback = 0;
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        var pagesize = data.pagesize;
        var pagenumber = data.pagenumber;
        var user = sails.ObjectID(data.user);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").aggregate([
                    {
                        $match: {
                            _id: user,
                            "post.postid": {
                                $exists: true
                            },
                            "post.postid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $unwind: "$post"
                    },
                    {
                        $match: {
                            "post.postid": {
                                $exists: true
                            },
                            "post.postid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $group: {
                            _id: user,
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $project: {
                            count: 1
                        }
                    }
                ]).toArray(function (err, result) {
                    if (result[0]) {
                        newreturns.total = result[0].count;
                        newreturns.totalpages = Math.ceil(result[0].count / data.pagesize);
                        newcallback++;
                    }
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                    }
                });
                db.collection("user").aggregate([
                    {
                        $match: {
                            _id: user,
                            "post.postid": {
                                $exists: true
                            },
                            "post.postid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $unwind: "$post"
                    },
                    {
                        $match: {
                            "post.postid": {
                                $exists: true
                            },
                            "post.postid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $project: {
                            post: 1
                        }
                    }
                ]).skip(pagesize * (pagenumber - 1)).limit(pagesize).toArray(
                    function (err, found) {
                        if (data != null) {
                            newreturns.data.push(found);
                            callback(newreturns);

                        }
                        if (err) {
                            console.log(err);
                            callback({
                                value: false
                            });
                        }
                    });
            }
        });
    },
    //Findlimited
    findone: function (data, callback) {
        var user = sails.ObjectID(data.user);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('user').find({
                    "_id": user,
                    "post._id": sails.ObjectID(data._id)
                }, {
                    "post.$": 1
                }).each(function (err, data2) {
                    if (data2 != null) {
                        callback(data2.post[0]);
                    }
                });
            }
        });
    },
    find: function (data, callback) {
        var user = sails.ObjectID(data.user);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('user').find({
                    "_id": user
                }).each(function (err, data) {
                    if (data != null) {
                        callback(data.post);
                    }
                });
            }
        });
    }
};