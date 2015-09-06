/**
 * DailyPostController
 *
 * @description :: Server-side logic for managing Dailyposts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    save: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        DailyPost.save(req.body, print);
    },
    find: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        DailyPost.find(req.body, print);
    },
    findlimited: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        DailyPost.findlimited(req.body, print);
    },
    findone: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        if (req.body && sails.ObjectID.isValid(req.body.user)) {
            DailyPost.findone(req.body, print);
        } else {
            res.json({
                "retweet": 0,
                "favorite": 0,
                "like": 0,
                "total": 0
            });
        }
    },
    delete: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        DailyPost.delete(req.body, print);
    }
};