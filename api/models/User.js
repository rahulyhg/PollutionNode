var insertdata = {};
var request = require('request');
var Twit = require('twit')

module.exports = {
  save: function(data, callback) {
    if (!data._id) {
      data._id = sails.ObjectID();
      if (!data.creationtime) {
        data.creationtime = data._id.getTimestamp();
      }
      data.modificationtime = data.creationtime;
      sails.query(function(err, db) {
        db.collection('user').insert(data, function(err, created) {
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
      sails.query(function(err, db) {
        var user = data._id;
        delete data._id;
        var dummy = sails.ObjectID();
        data.modificationtime = dummy.getTimestamp();
        db.collection('user').update({
          "_id": sails.ObjectID(user)
        }, {
          $set: data
        }, function(err, updated) {
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
  find: function(data, callback) {
    var returns = [];
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      if (db) {
        db.collection('user').find({}).toArray(function(err, found) {
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
  findlimited: function(data, callback) {
    var newcallback = 0;
    var newreturns = {};
    newreturns.data = [];
    var check = new RegExp(data.search, "i");
    var pagesize = parseInt(data.pagesize);
    var pagenumber = parseInt(data.pagenumber);
    sails.query(function(err, db) {
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
        }, function(err, number) {
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
        }).skip(pagesize * (pagenumber - 1)).limit(pagesize).each(function(err, found) {
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
  findone: function(data, callback) {
    sails.query(function(err, db) {
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
          }).each(function(err, data) {
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
      }
    });
  },
  delete: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      db.collection('user').remove({
        _id: sails.ObjectID(data._id)
      }, function(err, deleted) {
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
  findorcreate: function(data, callback) {
    var orfunc = {};
    if (data.provider == "Twitter") {
      insertdata.tweetid = data.id;
      insertdata.provider = data.provider;
      insertdata.username = data.username;
      insertdata.name = data.displayName;
      insertdata.profilepic = data.photos[0].value;
      insertdata.token = data.token;
      insertdata.tokenSecret = data.tokenSecret;
      orfunc.tweetid = data.id;
      dbcall(insertdata);
    } else {
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
      sails.query(function(err, db) {
        if (err) {
          return
        }
        if (db) {
          db.collection('user').findAndRemove(orfunc, function(err, removed) {
            if (err) {
              callback(err);
            }
            if (removed) {
              db.collection('user').insert(dbdata, function(err, created) {
                insertdata = {};
                if (err) {
                  callback(err);
                }
                if (created) {
                  delete data._raw;
                  delete data._json;
                  delete data.token;
                  delete data.tokenSecret;
                  delete data.accessToken;
                  delete data._accessLevel;
                  callback(null, data);
                  db.close();
                }
              });
            }
          });
        }
      });
    }
  },
  twitterpost: function(userid, message, callback) {
    var usertweetid = "";
    var access_token = "";
    var access_token_secret = "";
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
      }
      if (db) {
        db.collection('user').find({
          "_id": sails.ObjectID(userid)
        }).toArray(function(err, result) {
          if (result[0]) {
            usertweetid = result[0].tweetid;
            access_token = result[0].token;
            access_token_secret = result[0].tokenSecret;
            callrequest(db);
          }
          if (err) {
            console.log(err);
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
        status: message
      }, function(err, data, response) {
        data.user = userid;
        data.provider = "twitter";
        db.close();
        callback(err, data);
      });
    }
  },
  facebookpost: function(userid, message, link, callback) {
    var userfbid = "";
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
      }
      if (db) {
        db.collection('user').find({
          "_id": sails.ObjectID(userid)
        }).toArray(function(err, result) {
          if (result[0]) {
            userfbid = result[0].fbid;
            callrequest(db);
          }
          if (err) {
            console.log(err);
          }
        });
      }
    });

    function callrequest(db) {
      request.post({
        url: 'https://graph.facebook.com/v2.4/' + userfbid + '/feed',
        form: {
          access_token: "1616856265259993|HjeOYsxGLpafWdZ89YGQwu9L0Xs",
          message: message,
          link: link
        }
      }, function(err, httpResponse, body) {
        body = JSON.parse(body);
        body.fbid = userfbid;
        body.user = userid;
        body.provider = "facebook";
        db.close();
        callback(err, body);
      });
    }
  },
  twitterPostDetail: function(twitterpostid, userid, access_token, access_token_secret, callback) {
    var Twitter = new Twit({
      consumer_key: "6gOb3JlMDgqYw27fLN29l5Vmp",
      consumer_secret: "kEF99DQQssEZGJnJXvIBVTjuAs2vt1R8wji2OQ9nOc0fhlcVKM",
      access_token: access_token,
      access_token_secret: access_token_secret
    })
    Twitter.get('statuses/show', {
      id: twitterpostid
    }, function(err, data, response) {
      data.user = userid;
      data.provider = "twitter";
      data.id_str = twitterpostid;
      data._id = '';
      callback(err, data);
    });
  },
  facebookPostDetail: function(fbpostid, userid, callback) {
    request.get({
      url: 'https://graph.facebook.com/v2.4/' + fbpostid + "/likes?summary=true&access_token=1616856265259993|HjeOYsxGLpafWdZ89YGQwu9L0Xs",
    }, function(err, httpResponse, body) {
      body = JSON.parse(body);
      body.user = userid;
      body.provider = "facebook";
      body.id = fbpostid;
      body._id = '';
      callback(err, body);
    });
  }
};
