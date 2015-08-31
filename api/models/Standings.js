
module.exports = {
    save: function (data, callback) {
        var result = sails.ObjectID(data.result);
        delete data.result;
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
                    db.collection('result').update({
                        _id: result
                    }, {
                        $push: {
                            standings: data
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
            var attribute = "standings.$.";
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
                    db.collection('result').update({
                        "_id": result,
                        "standings._id": data._id
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
        var result = sails.ObjectID(data.result);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {

                db.collection('result').update({
                    "_id": result
                }, {
                    $pull: {
                        "standings": {
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
        var result = sails.ObjectID(data.result);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("result").aggregate([
                    {
                        $match: {
                            _id: result,
                            "standings.userid": {
                                $exists: true
                            },
                            "standings.userid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $unwind: "$standings"
                    },
                    {
                        $match: {
                            "standings.userid": {
                                $exists: true
                            },
                            "standings.userid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $group: {
                            _id: result,
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
                db.collection("result").aggregate([
                    {
                        $match: {
                            _id: result,
                            "standings.userid": {
                                $exists: true
                            },
                            "standings.userid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $unwind: "$standings"
                    },
                    {
                        $match: {
                            "standings.userid": {
                                $exists: true
                            },
                            "standings.userid": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $project: {
                            standings: 1
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
        var result = sails.ObjectID(data.result);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('result').find({
                    "_id": result,
                    "standings._id": sails.ObjectID(data._id)
                }, {
                    "standings.$": 1
                }).each(function (err, data2) {
                    if (data2 != null) {
                        callback(data2.standings[0]);
                    }
                });
            }
        });
    },
    find: function (data, callback) {
        var result = sails.ObjectID(data.result);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('result').find({
                    "_id": result
                }).each(function (err, data) {
                    if (data != null) {
                        callback(data.standings);
                    }
                });
            }
        });
    }
};