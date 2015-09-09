module.exports = {
    save: function (data, callback) {
        if (data.user && sails.ObjectID.isValid(data.user)) {
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
                            } else if (updated) {
                                callback({
                                    value: true,
                                    id: data._id
                                });
                            } else {
                                callback({
                                    value: false,
                                    comment: "No User Found"
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
                            } else if (updated) {
                                callback({
                                    value: true,
                                    id: data._id
                                });
                            } else {
                                callback({
                                    value: false,
                                    comment: "No User Found"
                                });
                            }
                        });
                    }
                });
            }
        } else {
            callback({
                value: false,
                comment: "Not Valid UserId"
            });
        }
    },
    delete: function (data, callback) {
        if (data.user && sails.ObjectID.isValid(data.user)) {
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
                        } else if (updated) {
                            callback({
                                value: true
                            });
                        } else {
                            callback({
                                value: false,
                                comment: "No User Found"
                            });
                        }
                    });
                }
            });
        } else {
            callback({
                value: false,
                comment: "Not Valid UserId"
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
        sails.query(function (err, db) {
            if (err) {
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('user').find({
                    "gallery._id": sails.ObjectID(data)
                }, {
                    "gallery.$": 1
                }).toArray(function (err, data2) {
                    if (err) {
                        callback({
                            value: false
                        });
                    } else if (data2.length > 0) {
                        callback(data2[0].gallery[0].imagefinal);
                    } else {
                        callback({
                            value: false
                        });
                    }
                });
            }
        });
    },
    findonegallery: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('user').find({
                    "gallery._id": sails.ObjectID(data)
                }, {
                    "gallery.$": 1
                }).toArray(function (err, data2) {
                    if (err) {
                        callback({
                            value: false
                        });
                    } else if (data2.length > 0) {
                        callback(data2[0].gallery[0].image);
                    } else {
                        callback({
                            value: false
                        });
                    }
                });
            }
        });
    },
    find: function (data, callback) {
        var user = sails.ObjectID(data);
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({
                    "_id": user
                }, {
                    _id: 0,
                    "gallery._id": 1,
                    "gallery.imagefinal": 1
                }, {
                    $sort: {
                        "gallery._id": -1
                    }
                }).toArray(function (err, data2) {
                    if (err) {
                        callback(err);
                    } else if (data2 && data2[0].gallery) {
                        callback(data2[0].gallery);
                    } else {
                        callback({
                            value: false
                        });
                    }
                });
            }
        });
    }
};