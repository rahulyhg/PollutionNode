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
                db.collection("dailypost").find({
                    date: data.date
                }).sort({
                    "count.totalcount": 1
                }).limit(100).toArray(function (err, data2) {
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
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('dailypost').find({
                    "count.user": sails.ObjectID(data.user)
                }).each(function (err, data2) {
                    if (data2 != null) {
                        callback(data2);
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