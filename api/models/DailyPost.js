module.exports = {
    save: function (data, callback) {
        var user = sails.ObjectID(data.user);
        _.each(data.post, function (n) {
            n.user = sails.ObjectID(n.user);
        });
        if (!data._id) {
            data._id = sails.ObjectID();
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });
                }
                if (db) {
                    delete data.user;
                    db.collection('user').update({
                        _id: user
                    }, {
                        $push: {
                            dailypost: data
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
            data._id = sails.ObjectID(data._id);
            var tobechanged = {};
            var attribute = "dailypost.$.";
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
                        "dailypost._id": data._id
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
        }
    },
    delete: function (data, callback) {
        var user = sails.ObjectID(data.user);
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
                        "dailypost": {
                            "_id": sails.ObjectID(data._id)
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
                            "dailypost.postid": {
                                $exists: true
                            },
                            "dailypost.postid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $unwind: "$dailypost"
                    },
                    {
                        $match: {
                            "dailypost.postid": {
                                $exists: true
                            },
                            "dailypost.postid": {
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
                            "dailypost.postid": {
                                $exists: true
                            },
                            "dailypost.postid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $unwind: "$dailypost"
                    },
                    {
                        $match: {
                            "dailypost.postid": {
                                $exists: true
                            },
                            "dailypost.postid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $project: {
                            dailypost: 1
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
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('user').find({
                    "dailypost.count.user": sails.ObjectID(data.user)
                }, {
                    "dailypost.$": 1
                }).each(function (err, data2) {
                    if (data2 != null) {
                        callback(data2.dailypost[0]);
                    }
                });
            }
        });
    },
    find: function (data, callback) {
        var sort = {};
        sort['dailypost.count.totalcount'] = 1;
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });

            }
            if (db) {
                db.collection("user").aggregate([{
                    $match: {
                        "dailypost._id": {
                            $exists: true
                        },
                        "dailypost.creationtime": data.date
                    }
        }, {
                    $unwind: "$dailypost"
        }, {
                    $match: {
                        "dailypost._id": {
                            $exists: true
                        },
                        "dailypost.creationtime": data.date
                    }
        }, {
                    $project: {
                        dailypost: 1
                    }
        }, {
                    $sort: sort
        }]).limit(100).toArray(
                    function (err, data2) {
                        if (data != null) {
                            callback(data2);
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
    orderbydays:function(data,callback){
        
    }
};