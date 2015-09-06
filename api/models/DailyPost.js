module.exports = {
    save: function (data, callback) {
        var updatecase = {};
        if (data.date) {
            updatecase.date = data.date;
        } else {
            updatecase.type = data.type;
        }
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
            }
            if (db) {
                db.collection('dailypost').find(updatecase).toArray(function (err, data2) {
                    if (err) {
                        console.log(err);
                    }
                    if (data2 && data2[0]) {
                        db.collection('dailypost').update(updatecase, {
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
                    } else {
                        if (!data._id) {
                            data._id = sails.ObjectID();
                            db.collection('dailypost').insert(data, function (err, created) {
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
                        } else {
                            var dailypost = data._id;
                            delete data._id;
                            db.collection('dailypost').update({
                                "_id": sails.ObjectID(dailypost)
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
                        }
                    }
                });
            }
        });
    },
    find: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                if (data.date) {
                    db.collection("dailypost").aggregate([{
                        $match: {
                            date: data.date
                        }
                    }, {
                        $unwind: "$leaderboard"
        }, {
                        $match: {
                            date: data.date
                        }
        }, {
                        $project: {
                            leaderboard: 1
                        }
        }]).toArray(
                        function (err, data) {
                            if (data != null) {
                                callback(data);

                            }
                            if (err) {
                                console.log(err);
                                callback({
                                    value: false
                                });

                            }
                        });
                } else {
                    db.collection("dailypost").aggregate([{
                        $match: {
                            type: data.type
                        }
        }, {
                        $unwind: "$leaderboard"
        }, {
                        $match: {
                            type: data.type
                        }
        }, {
                        $project: {
                            leaderboard: 1
                        }
        }]).toArray(
                        function (err, data) {
                            if (data != null) {
                                callback(data);

                            }
                            if (err) {
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
                db.collection("image").count({
                    type: {
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
                db.collection("image").find({
                    type: {
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
                res.json({
                    value: "false"
                });
            }
            if (db) {
                db.collection("user").aggregate([
                    {
                        $match: {
                            "_id": sails.ObjectID(data.user)
                        }
                    }, {
                        $unwind: "$post"
                    }, {
                        $group: {
                            _id:"$_id",
                            retweet: {
                                $sum: '$post.retweet_count'
                            },
                            favorite: {
                                $sum: '$post.favorite_count'
                            },
                            like: {
                                $sum: '$post.total_likes'
                            },
                           
                        }
                    },
                    {
                        $project: {
                            _id:0,
                            retweet: 1,
                            favorite: 1,
                            like: 1,
                            total: {
                                $add: ["$like", "$retweet", "$favorite"]
                            }
                        }
                        },
                    ]).toArray(function (err, data2) {

                   
                    if (err) {
                        console.log(err);
                        callback({
                            "retweet": 0,
                            "favorite": 0,
                            "like": 0,
                            "total": 0
                        });
                    }
                    if (data2.length != 0) {
                        callback(data2[0]);
                    } else {
                        callback({
                            "retweet": 0,
                            "favorite": 0,
                            "like": 0,
                            "total": 0
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
            db.collection('image').remove({
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
    }
};