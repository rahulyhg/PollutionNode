module.exports = {
    save: function (data, callback) {
        var user = sails.ObjectID(data.user);
        delete data.user;
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
                    db.collection('user').update({
                        _id: user
                    }, {
                        $push: {
                            gallery: data
                        }
                    }, function (err, updated) {
                        if (err) {
                            console.log(err);
                        }
                        if (updated) {
                            callback({
                                value: true,
                                id: data._id
                            });
                        }
                    });
                }
            });
        } else {
            data._id = sails.ObjectID(data._id);
            var tobechanged = {};
            var attribute = "gallery.$.";
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
                        "gallery._id": data._id
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
                        "gallery": {
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
                            "gallery.id": {
                                $exists: true
                            },
                            "gallery.id": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $unwind: "$gallery"
                    },
                    {
                        $match: {
                            "gallery.id": {
                                $exists: true
                            },
                            "gallery.id": {
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
                            "gallery.id": {
                                $exists: true
                            },
                            "gallery.id": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $unwind: "$gallery"
                    },
                    {
                        $match: {
                            "gallery.id": {
                                $exists: true
                            },
                            "gallery.id": {
                                $regex: check
                            }
                        }
                    },
                    {
                        $project: {
                            gallery: 1
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
                    "gallery._id": sails.ObjectID(data._id)
                }, {
                    "gallery.$": 1
                }).each(function (err, data2) {
                    if (data2 != null) {
                        callback(data2.gallery[0]);
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
                        callback(data.gallery);
                    }
                });
            }
        });
    }
};